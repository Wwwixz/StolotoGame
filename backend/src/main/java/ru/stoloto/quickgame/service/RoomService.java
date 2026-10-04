package ru.stoloto.quickgame.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.stoloto.quickgame.domain.Participant;
import ru.stoloto.quickgame.domain.Player;
import ru.stoloto.quickgame.domain.Room;
import ru.stoloto.quickgame.domain.RoomStatus;
import ru.stoloto.quickgame.domain.RoundRecord;
import ru.stoloto.quickgame.dto.ParticipantDto;
import ru.stoloto.quickgame.dto.RoomStateDto;
import ru.stoloto.quickgame.dto.RoomSummaryDto;
import ru.stoloto.quickgame.dto.GameException;
import ru.stoloto.quickgame.repo.ParticipantRepository;
import ru.stoloto.quickgame.repo.PlayerRepository;
import ru.stoloto.quickgame.repo.RoomRepository;
import ru.stoloto.quickgame.repo.RoundRecordRepository;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Игровые комнаты: создание, вход с резервированием баллов, буст, заполнение ботами,
 * запуск розыгрыша и выплаты. Все переходы состояния комнаты проходят через этот сервис,
 * движок (GameEngine) только вызывает их по таймеру.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    /** Когда комната заполнилась до старта таймера — короткая пауза перед розыгрышем. */
    private static final long FULL_GRACE_MS = 5000;

    private final RoomRepository rooms;
    private final ParticipantRepository participants;
    private final PlayerRepository players;
    private final RoundRecordRepository records;
    private final WalletService wallet;
    private final WinnerService winnerService;
    private final JournalService journal;
    private final GameProperties props;

    private final AtomicInteger botCounter = new AtomicInteger((int) (System.currentTimeMillis() % 90));

    // ---------- создание ----------

    @Transactional
    public Room create(String title, String description, int seats, int entryPrice, int fundPercent,
                       boolean boostEnabled, int boostPrice, int boostBonusPct, int waitSeconds, String source) {
        Room room = Room.builder()
                .title(title)
                .description(description != null && !description.isBlank()
                        ? description
                        : "%d мест · вход %d баллов · %d%% взносов в призовой фонд".formatted(seats, entryPrice, fundPercent))
                .status(RoomStatus.OPEN)
                .seats(seats)
                .entryPrice(entryPrice)
                .fundPercent(fundPercent)
                .boostEnabled(boostEnabled)
                .boostPrice(boostPrice)
                .boostBonusPct(boostBonusPct)
                .waitSeconds(waitSeconds)
                .source(source)
                .createdAt(System.currentTimeMillis())
                .settled(false)
                .build();
        return rooms.save(room);
    }

    // ---------- чтение ----------

    @Transactional(readOnly = true)
    public List<RoomSummaryDto> lobby() {
        return rooms.findByStatusOrderByIdAsc(RoomStatus.OPEN).stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Room getRoom(Long id) {
        return rooms.findById(id)
                .orElseThrow(() -> new GameException(GameException.Code.NOT_FOUND, "Комната #" + id + " не найдена"));
    }

    @Transactional(readOnly = true)
    public List<Participant> participantsOf(Room room) {
        return participants.findByRoomIdOrderByIdAsc(room.getId());
    }

    @Transactional(readOnly = true)
    public RoomStateDto toState(Room room) {
        List<Participant> ps = participantsOf(room);
        boolean full = ps.size() >= room.getSeats();
        // Пока идёт визуальная трансляция розыгрыша (RUNNING), результат не раскрываем —
        // победитель появляется в момент перехода в FINISHED.
        boolean hidden = room.getStatus() == RoomStatus.RUNNING;
        return new RoomStateDto(
                room.getId(),
                room.getTitle(),
                room.getDescription(),
                room.getStatus().name(),
                room.getSeats(),
                ps.size(),
                room.getEntryPrice(),
                room.getFundPercent(),
                currentFund(room, ps.size()),
                projectedFund(room),
                room.isBoostEnabled(),
                room.getBoostPrice(),
                room.getBoostBonusPct(),
                room.getWaitSeconds(),
                room.getPhaseEndsAt(),
                System.currentTimeMillis(),
                room.getSource(),
                ps.stream().map(p -> toParticipantDto(p, room)).collect(Collectors.toList()),
                !hidden && room.getCombination() != null
                        ? Arrays.stream(room.getCombination().split(",")).map(Integer::valueOf).toList()
                        : List.of(),
                hidden ? null : winnerName(ps, room),
                hidden || isWinnerBot(ps, room) || room.getWinnerParticipantId() == null ? null
                        : ps.stream().filter(p -> p.getId().equals(room.getWinnerParticipantId()))
                        .map(Participant::getPlayerId)
                        .filter(java.util.Objects::nonNull)
                        .findFirst().orElse(null),
                hidden || isWinnerBot(ps, room),
                room.getStatus() == RoomStatus.FINISHED ? room.getPayout() : null,
                hidden ? null : room.getSeed(),
                room.getStatus() == RoomStatus.OPEN && !full && room.getPhaseEndsAt() != null
        );
    }

    public RoomSummaryDto toSummary(Room room) {
        int occupied = participants.countByRoomId(room.getId());
        return new RoomSummaryDto(
                room.getId(),
                room.getTitle(),
                room.getStatus().name(),
                room.getSeats(),
                occupied,
                room.getEntryPrice(),
                room.getFundPercent(),
                currentFund(room, occupied),
                projectedFund(room),
                room.isBoostEnabled(),
                room.getBoostPrice(),
                room.getBoostBonusPct(),
                room.getWaitSeconds(),
                room.getPhaseEndsAt(),
                System.currentTimeMillis()
        );
    }

    private long currentFund(Room room, int occupied) {
        return Math.round((long) occupied * room.getEntryPrice() * room.getFundPercent() / 100.0);
    }

    private long projectedFund(Room room) {
        return Math.round((long) room.getSeats() * room.getEntryPrice() * room.getFundPercent() / 100.0);
    }

    private ParticipantDto toParticipantDto(Participant p, Room room) {
        return new ParticipantDto(p.getId(), p.getPlayerId(), p.getName(), p.isBot(), p.isBoost(),
                p.getSeatNumber(), winnerService.weightOf(p, room.getBoostBonusPct()));
    }

    private String winnerName(List<Participant> ps, Room room) {
        if (room.getWinnerParticipantId() == null) return null;
        return ps.stream()
                .filter(p -> p.getId().equals(room.getWinnerParticipantId()))
                .map(Participant::getName)
                .findFirst()
                .orElse(null);
    }

    private boolean isWinnerBot(List<Participant> ps, Room room) {
        if (room.getWinnerParticipantId() == null) return false;
        return ps.stream()
                .filter(p -> p.getId().equals(room.getWinnerParticipantId()))
                .map(Participant::isBot)
                .findFirst()
                .orElse(false);
    }

    // ---------- участие ----------

    @Transactional
    public RoomStateDto join(Long roomId, Long playerId) {
        Room room = getRoom(roomId);
        if (room.getStatus() != RoomStatus.OPEN) {
            throw new GameException(GameException.Code.ROOM_STARTED, "Раунд уже начался — комната недоступна для входа");
        }
        List<Participant> ps = participantsOf(room);
        if (ps.size() >= room.getSeats()) {
            throw new GameException(GameException.Code.ROOM_FULL, "В комнате не осталось свободных мест");
        }
        Player player = players.findById(playerId)
                .orElseThrow(() -> new GameException(GameException.Code.NOT_FOUND, "Игрок не найден"));
        if (ps.stream().anyMatch(p -> playerId.equals(p.getPlayerId()))) {
            throw new GameException(GameException.Code.ALREADY_JOINED, "Вы уже участвуете в этой комнате");
        }

        // Ключевая механика ТЗ: баллы резервируются на время раунда.
        try {
            wallet.reserve(player, room, room.getEntryPrice());
        } catch (GameException e) {
            // Сценарий 6 ТЗ: понятная причина отказа + более дешёвые комнаты.
            throw new GameException(e.getCode(), e.getMessage(), cheaperAlternatives(player.getBalance(), roomId));
        }

        int seat = ps.stream().mapToInt(Participant::getSeatNumber).max().orElse(0) + 1;
        participants.save(Participant.builder()
                .room(room)
                .playerId(player.getId())
                .name(player.getName())
                .bot(player.isBot())
                .boost(false)
                .seatNumber(seat)
                .joinedAt(System.currentTimeMillis())
                .build());

        // Таймер ожидания стартует с первым участником комнаты (по ТЗ ~1 минута).
        long now = System.currentTimeMillis();
        if (room.getPhaseEndsAt() == null) {
            room.setPhaseEndsAt(now + room.getWaitSeconds() * 1000L);
        }
        // Полная комната — не заставляем ждать: короткая пауза и старт.
        if (seat >= room.getSeats()) {
            room.setPhaseEndsAt(Math.min(room.getPhaseEndsAt(), now + FULL_GRACE_MS));
        }
        log.info("Player {} joined room #{} ({}/{})", player.getName(), roomId, seat, room.getSeats());
        return toState(room);
    }

    @Transactional
    public RoomStateDto leave(Long roomId, Long playerId) {
        Room room = getRoom(roomId);
        if (room.getStatus() != RoomStatus.OPEN) {
            throw new GameException(GameException.Code.ROOM_STARTED, "Раунд уже начался — выйти нельзя");
        }
        Participant p = participants.findByRoomIdAndPlayerId(roomId, playerId)
                .orElseThrow(() -> new GameException(GameException.Code.NOT_JOINED, "Вы не участвуете в этой комнате"));
        wallet.refund(players.findById(playerId).orElseThrow(), room, room.getEntryPrice());
        participants.delete(p);
        log.info("Player {} left room #{}", playerId, roomId);
        return toState(room);
    }

    @Transactional
    public RoomStateDto buyBoost(Long roomId, Long playerId) {
        Room room = getRoom(roomId);
        if (room.getStatus() != RoomStatus.OPEN) {
            throw new GameException(GameException.Code.ROOM_STARTED, "Буст можно купить только до старта раунда");
        }
        if (!room.isBoostEnabled()) {
            throw new GameException(GameException.Code.BOOST_DISABLED, "В этой комнате буст не предусмотрен");
        }
        Participant p = participants.findByRoomIdAndPlayerId(roomId, playerId)
                .orElseThrow(() -> new GameException(GameException.Code.NOT_JOINED, "Сначала войдите в комнату"));
        if (p.isBoost()) {
            throw new GameException(GameException.Code.BOOST_ALREADY,
                    "Буст уже активирован: в одном раунде он применяется один раз");
        }
        Player player = players.findById(playerId)
                .orElseThrow(() -> new GameException(GameException.Code.NOT_FOUND, "Игрок не найден"));
        try {
            wallet.spend(player, room, room.getBoostPrice(),
                    "Буст в комнате #" + room.getId() + " (+" + room.getBoostBonusPct() + "% к весу)");
        } catch (GameException e) {
            throw new GameException(e.getCode(), e.getMessage(), cheaperAlternatives(player.getBalance(), roomId));
        }
        p.setBoost(true);
        log.info("Player {} boosted room #{} (+{}%)", player.getName(), roomId, room.getBoostBonusPct());
        return toState(room);
    }

    @Transactional
    public void closeByAdmin(Long roomId) {
        Room room = getRoom(roomId);
        if (room.getStatus() == RoomStatus.FINISHED || room.getStatus() == RoomStatus.CLOSED) {
            return;
        }
        for (Participant p : participantsOf(room)) {
            if (!p.isBot()) {
                wallet.refund(players.findById(p.getPlayerId()).orElseThrow(), room, room.getEntryPrice());
            }
        }
        participants.deleteAll(participantsOf(room));
        room.setStatus(RoomStatus.CLOSED);
        room.setPhaseEndsAt(null);
        log.info("Room #{} closed by admin", roomId);
    }

    // ---------- вызовы движка ----------

    /** Один бот занимает одно место. Возвращает true, если добавлен. */
    @Transactional
    public boolean fillNextBot(Room room) {
        if (room.getStatus() != RoomStatus.OPEN) return false;
        List<Participant> ps = participantsOf(room);
        if (ps.size() >= room.getSeats()) return false;

        int seat = ps.stream().mapToInt(Participant::getSeatNumber).max().orElse(0) + 1;
        participants.save(Participant.builder()
                .room(room)
                .playerId(null)
                .name(nextBotName())
                .bot(true)
                .boost(false)
                .seatNumber(seat)
                .joinedAt(System.currentTimeMillis())
                .build());
        return true;
    }

    /** Розыгрыш: победитель определяется здесь, по весам мест и бустов. */
    @Transactional
    public void startDraw(Room detached) {
        // Движок может передать отсоединённую сущность — работаем с управляемой копией.
        Room room = rooms.findById(detached.getId()).orElse(detached);
        if (room.getStatus() != RoomStatus.OPEN) return;
        List<Participant> ps = participantsOf(room);
        if (ps.isEmpty()) {
            room.setPhaseEndsAt(null);
            return;
        }

        WinnerService.DrawResult draw = winnerService.draw(ps, room.getBoostBonusPct());
        long fundTotal = (long) ps.size() * room.getEntryPrice();
        long payout = Math.round(fundTotal * room.getFundPercent() / 100.0);
        long boostIncome = ps.stream().filter(Participant::isBoost).count() * room.getBoostPrice();

        room.setStatus(RoomStatus.RUNNING);
        room.setPhaseEndsAt(System.currentTimeMillis() + props.getDrawSeconds() * 1000L);
        room.setWinnerParticipantId(draw.winner().getId());
        room.setFundTotal(fundTotal);
        room.setPayout(payout);
        room.setCombination(draw.combination().stream().map(String::valueOf).collect(Collectors.joining(",")));
        room.setSeed(draw.seed());
        room.setRngValue(draw.rngValue());
        room.setTotalWeight(draw.totalWeight());

        records.save(RoundRecord.builder()
                .roomId(room.getId())
                .roomTitle(room.getTitle())
                .seats(room.getSeats())
                .entryPrice(room.getEntryPrice())
                .fundPercent(room.getFundPercent())
                .occupied(ps.size())
                .fundTotal(fundTotal)
                .payout(payout)
                .systemIncome(0)
                .boostIncome(boostIncome)
                .winnerName(draw.winner().getName())
                .winnerIsBot(draw.winner().isBot())
                .winnerPlayerId(draw.winner().getPlayerId())
                .combination(room.getCombination())
                .winnerBall(draw.winner().getSeatNumber())
                .seed(draw.seed())
                .rngValue(draw.rngValue())
                .totalWeight(draw.totalWeight())
                .participantsJson(journal.writeParticipants(draw.entries(), room.getBoostBonusPct()))
                .startedAt(System.currentTimeMillis())
                .finishedAt(0)
                .build());

        log.info("Room #{} DRAW: winner={} (bot={}), fund={}, payout={}, seed={}, rng={}/{}",
                room.getId(), draw.winner().getName(), draw.winner().isBot(), fundTotal, payout,
                draw.seed(), draw.rngValue(), Math.round(draw.totalWeight() * 1000));
    }

    /** Завершение раунда: списание резервов и выплата победителю. */
    @Transactional
    public void settle(Room detached) {
        Room room = rooms.findById(detached.getId()).orElse(detached);
        if (room.getStatus() != RoomStatus.RUNNING || room.isSettled()) return;

        List<Participant> ps = participantsOf(room);
        for (Participant p : ps) {
            if (p.isBot()) continue;
            Player player = players.findById(p.getPlayerId()).orElse(null);
            if (player == null) continue;
            wallet.consumeReserved(player, room, room.getEntryPrice());
            if (p.getId().equals(room.getWinnerParticipantId())) {
                wallet.credit(player, room, room.getPayout(), latestRecordId(room.getId()));
            }
        }

        boolean botWon = isWinnerBot(ps, room);
        long systemIncome = (room.getFundTotal() - room.getPayout())
                + ps.stream().filter(Participant::isBoost).count() * room.getBoostPrice()
                + (botWon ? room.getPayout() : 0);

        records.findTop1ByRoomIdOrderByIdDesc(room.getId()).ifPresent(rec -> {
            rec.setSystemIncome(systemIncome);
            rec.setFinishedAt(System.currentTimeMillis());
            records.save(rec);
        });

        room.setStatus(RoomStatus.FINISHED);
        room.setPhaseEndsAt(System.currentTimeMillis());
        room.setSettled(true);
        log.info("Room #{} FINISHED: winner={}, payout={}, systemIncome={}",
                room.getId(), winnerName(ps, room), room.getPayout(), systemIncome);
    }

    /** Подсказка игроку при отказе по балансу: более дешёвые открытые комнаты. */
    @Transactional(readOnly = true)
    public List<RoomSummaryDto> cheaperAlternatives(long maxPrice, long excludeRoomId) {
        return lobby().stream()
                .filter(r -> r.id() != excludeRoomId)
                .filter(r -> r.price() <= maxPrice)
                .sorted(Comparator.comparingLong(RoomSummaryDto::price))
                .limit(3)
                .collect(Collectors.toList());
    }

    private Long latestRecordId(Long roomId) {
        return records.findTop1ByRoomIdOrderByIdDesc(roomId).map(RoundRecord::getId).orElse(null);
    }

    private String nextBotName() {
        return "bot_" + String.format("%02d", botCounter.incrementAndGet() % 100);
    }
}
