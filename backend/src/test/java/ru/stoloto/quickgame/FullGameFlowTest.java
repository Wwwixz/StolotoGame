package ru.stoloto.quickgame;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import ru.stoloto.quickgame.domain.Participant;
import ru.stoloto.quickgame.domain.Player;
import ru.stoloto.quickgame.domain.Room;
import ru.stoloto.quickgame.domain.RoomStatus;
import ru.stoloto.quickgame.dto.EconomyAnalysis;
import ru.stoloto.quickgame.dto.GameException;
import ru.stoloto.quickgame.dto.JournalRowDto;
import ru.stoloto.quickgame.dto.RoomStateDto;
import ru.stoloto.quickgame.dto.RoomSummaryDto;
import ru.stoloto.quickgame.repo.PlayerRepository;
import ru.stoloto.quickgame.service.EconomyService;
import ru.stoloto.quickgame.service.JournalService;
import ru.stoloto.quickgame.service.MatchmakingService;
import ru.stoloto.quickgame.dto.MatchRequest;
import ru.stoloto.quickgame.service.RoomService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

/**
 * Сквозной игровой цикл по ТЗ: подбор комнаты → вход с резервом → буст → боты →
 * розыгрыш backend-логикой → выплаты → журнал и история. Работает на встраиваемой H2.
 */
@SpringBootTest(properties = {"game.auto-host=false"})
class FullGameFlowTest {

    @Autowired RoomService roomService;
    @Autowired MatchmakingService matchmaking;
    @Autowired JournalService journal;
    @Autowired EconomyService economy;
    @Autowired PlayerRepository players;

    @Test
    void fullCycleReserveBoostDrawPayout() {
        Player hero = players.findByName("player_4827").orElseThrow();
        final Long heroId = hero.getId();
        long startBalance = hero.getBalance();

        Room room = roomService.create("Тест-комната", null, 5, 100, 85, true, 40, 50, 60, "ADMIN");

        // --- вход: резерв 100 баллов ---
        RoomStateDto joined = roomService.join(room.getId(), heroId);
        assertThat(joined.occupied()).isEqualTo(1);
        assertThat(joined.participants().get(0).boost()).isFalse();
        hero = players.findById(heroId).orElseThrow();
        assertThat(hero.getBalance()).isEqualTo(startBalance - 100);
        assertThat(hero.getReserved()).isEqualTo(100);

        // --- буст: раз за раунд, списывается с доступного баланса ---
        roomService.buyBoost(room.getId(), heroId);
        assertThatThrownBy(() -> roomService.buyBoost(room.getId(), heroId))
                .isInstanceOf(GameException.class)
                .hasMessageContaining("один раз");
        hero = players.findById(heroId).orElseThrow();
        assertThat(hero.getBalance()).isEqualTo(startBalance - 140);

        // --- боты заполняют комнату ---
        for (int i = 0; i < 4; i++) {
            assertThat(roomService.fillNextBot(room)).isTrue();
        }
        assertThat(roomService.fillNextBot(room)).isFalse();

        // --- розыгрыш: победитель определяется backend-логикой ---
        roomService.startDraw(room);
        Room afterDraw = roomService.getRoom(room.getId());
        assertThat(afterDraw.getStatus()).isEqualTo(RoomStatus.RUNNING);
        assertThat(afterDraw.getFundTotal()).isEqualTo(500);
        assertThat(afterDraw.getPayout()).isEqualTo(425);
        assertThat(afterDraw.getSeed()).isNotBlank();
        assertThat(afterDraw.getCombination()).matches("\\d+(,\\d+)*");

        // --- выплаты ---
        roomService.settle(room);
        Room finished = roomService.getRoom(room.getId());
        assertThat(finished.getStatus()).isEqualTo(RoomStatus.FINISHED);

        Player after = players.findById(hero.getId()).orElseThrow();
        assertThat(after.getReserved()).isEqualTo(0); // резерв списан в фонд
        Participant winner = participants(room).stream()
                .filter(p -> p.getId().equals(finished.getWinnerParticipantId()))
                .findFirst().orElseThrow();
        boolean heroWon = !winner.isBot() && hero.getId().equals(winner.getPlayerId());
        long expected = startBalance - 140 + (heroWon ? 425 : 0);
        assertThat(after.getBalance()).isEqualTo(expected);

        // --- журнал раундов: proof-of-RNG ---
        List<JournalRowDto> journalRows = journal.list();
        JournalRowDto row = journalRows.stream()
                .filter(r -> r.roomId() == room.getId())
                .findFirst().orElseThrow();
        assertThat(row.participants()).hasSize(5);
        assertThat(row.seed()).isEqualTo(finished.getSeed());
        assertThat(row.totalWeight()).isEqualTo(5.5); // буст +50%: 1.5 + 4 бота × 1.0
        assertThat(row.systemIncome()).isEqualTo(500 - 425 + 40 + (row.winnerIsBot() ? 425 : 0));

        // --- история игрока ---
        var history = journal.roundsOfPlayer(hero.getId());
        assertThat(history).extracting(JournalRowDto::roomId).contains(room.getId());
    }

    @Test
    void insufficientFundsGivesAlternatives() {
        Player poor = players.findByName("player_9167").orElseThrow();
        poor.setBalance(30);
        players.save(poor);

        Room rich = roomService.create("Дорогая", null, 5, 500, 85, false, 0, 0, 60, "ADMIN");
        Room cheap = roomService.create("Дешёвая", null, 5, 20, 85, false, 0, 0, 60, "ADMIN");

        GameException e = catchThrowableOfType(() -> roomService.join(rich.getId(), poor.getId()),
                GameException.class);
        assertThat(e).hasMessageContaining("Недостаточно");
        assertThat(e.getAlternatives()).extracting(RoomSummaryDto::id).contains(cheap.getId());
    }

    @Test
    void matchmakingReturnsFittingRoomOrCreatesNew() {
        Player user = players.findByName("player_6194").orElseThrow();

        // Точная комбинация параметров не существует — система создаёт комнату.
        var resp = matchmaking.match(new MatchRequest(user.getId(), 7, 123, 130, 80, false));
        assertThat(resp.created()).isTrue();
        assertThat(resp.rooms()).hasSize(1);
        RoomSummaryDto created = resp.rooms().get(0);
        assertThat(created.seats()).isEqualTo(7);
        assertThat(created.price()).isBetween(123, 130);

        // Теперь под такие параметры есть открытая комната — матчмейкинг её находит.
        var again = matchmaking.match(new MatchRequest(user.getId(), 7, 100, 150, 70, false));
        assertThat(again.created()).isFalse();
        assertThat(again.rooms()).extracting(RoomSummaryDto::id).contains(created.id());
    }

    @Test
    void configAnalysisBlocksUnprofitable() {
        var tooGenerous = new ru.stoloto.quickgame.dto.RoomConfigRequest("Щедрая", 10, 100, 99, false, 0, 0, 60, null);
        EconomyAnalysis a = economy.analyze(tooGenerous);
        assertThat(a.blocked()).isTrue();
    }

    @Test
    void botWinnerDoesNotBreakRoomState() {
        // Комната из одних ботов: победитель гарантированно бот (приз остаётся в системе).
        Room room = roomService.create("Боты-турнир", null, 4, 50, 85, false, 0, 0, 60, "ADMIN");
        for (int i = 0; i < 4; i++) {
            roomService.fillNextBot(room);
        }
        roomService.startDraw(room);
        RoomStateDto running = roomService.toState(roomService.getRoom(room.getId()));
        assertThat(running.status()).isEqualTo("RUNNING");
        assertThat(running.winnerName()).isNull(); // результат скрыт до конца трансляции

        roomService.settle(room);
        RoomStateDto finished = roomService.toState(roomService.getRoom(room.getId()));
        assertThat(finished.status()).isEqualTo("FINISHED");
        assertThat(finished.winnerName()).isNotBlank();
        assertThat(finished.winnerIsBot()).isTrue();
        assertThat(finished.winnerPlayerId()).isNull(); // у бота нет игрока — и это не должно ронять NPE
        assertThat(finished.combination()).isNotEmpty();
    }

    private List<Participant> participants(Room room) {
        return roomService.participantsOf(room);
    }
}
