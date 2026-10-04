package ru.stoloto.quickgame;

import org.junit.jupiter.api.Test;
import ru.stoloto.quickgame.domain.Participant;
import ru.stoloto.quickgame.domain.Room;
import ru.stoloto.quickgame.service.WinnerService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class WinnerServiceTest {

    private final WinnerService service = new WinnerService();

    private Participant p(long id, String name, boolean bot, boolean boost, int seat) {
        return Participant.builder().id(id).name(name).bot(bot).boost(boost).seatNumber(seat).build();
    }

    @Test
    void weightReflectsBoost() {
        assertThat(service.weightOf(p(1, "a", false, false, 1), 25)).isEqualTo(1.0);
        assertThat(service.weightOf(p(2, "b", false, true, 2), 25)).isEqualTo(1.25);
        assertThat(service.weightOf(p(3, "c", false, true, 3), 100)).isEqualTo(2.0);
    }

    @Test
    void rangesAreContiguousAndCoverAllParticipants() {
        List<Participant> ps = List.of(
                p(1, "player", false, false, 1),
                p(2, "bot", true, false, 2),
                p(3, "boosted", false, true, 3));

        WinnerService.DrawResult draw = service.draw(ps, 100);

        assertThat(draw.totalWeight()).isEqualTo(4.0);
        assertThat(draw.entries()).hasSize(3);
        assertThat(draw.entries().get(0).rangeFrom()).isEqualTo(0.0);
        for (int i = 1; i < draw.entries().size(); i++) {
            assertThat(draw.entries().get(i).rangeFrom())
                    .isEqualTo(draw.entries().get(i - 1).rangeTo());
        }
        assertThat(draw.entries().get(2).rangeTo()).isEqualTo(4.0);

        // rngValue сохраняется в тысячных долях totalWeight
        assertThat(draw.rngValue()).isBetween(0L, 4000L);
        assertThat(draw.seed()).matches("[0-9a-f]{8}");
        assertThat(draw.winner()).isIn(ps);
    }

    @Test
    void boostedParticipantWinsWhenRngFallsIntoHisRange() {
        // Проверка распределения: победитель всегда соответствует диапазону, в который попал ГСЧ.
        List<Participant> ps = List.of(
                p(1, "a", false, false, 1),
                p(2, "b", false, true, 2));
        for (int i = 0; i < 200; i++) {
            WinnerService.DrawResult draw = service.draw(ps, 100);
            var entry = draw.entries().stream()
                    .filter(e -> e.participant().getId().equals(draw.winner().getId()))
                    .findFirst().orElseThrow();
            double roll = draw.rngValue() / 1000.0; // округление до тысячных — допуск 0.001
            assertThat(roll).isGreaterThanOrEqualTo(entry.rangeFrom() - 0.001);
            assertThat(roll).isLessThan(entry.rangeTo() + 0.001);
        }
    }

    @Test
    void combinationIsFourUniqueNumbersIn36() {
        List<Integer> c = service.combination(4, 36);
        assertThat(c).hasSize(4).doesNotHaveDuplicates();
        assertThat(c).allMatch(n -> n >= 1 && n <= 36);
    }

    @Test
    void emptyRoomCannotDraw() {
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.draw(List.of(), 25))
                .isInstanceOf(IllegalStateException.class);
    }
}
