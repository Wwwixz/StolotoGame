package ru.stoloto.quickgame.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.stoloto.quickgame.domain.Room;
import ru.stoloto.quickgame.dto.MatchRequest;
import ru.stoloto.quickgame.dto.MatchResponse;
import ru.stoloto.quickgame.dto.RoomSummaryDto;
import java.util.Comparator;
import java.util.List;

/**
 * Матчмейкинг (ТЗ: «пользователь задаёт пожелания, система находит комнату,
 * которая им соответствует»). Комната подбирается по цене входа, числу мест,
 * проценту фонда и наличию буста с учётом текущей загрузки. Механика должна быть
 * быстрой: если подходящей открытой комнаты нет — система мгновенно создаёт новую
 * под параметры запроса, пользователь не ждёт начала игры.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MatchmakingService {

    private final RoomService roomService;

    public MatchResponse match(MatchRequest req) {
        List<RoomSummaryDto> open = roomService.lobby().stream()
                .filter(r -> "OPEN".equals(r.status()))
                .toList();

        Integer priceMin = req.priceMin() == null ? 0 : req.priceMin();
        Integer priceMax = req.priceMax() == null ? Integer.MAX_VALUE : req.priceMax();
        int minFund = req.minFundPercent() == null ? 0 : req.minFundPercent();

        List<RoomSummaryDto> fitting = open.stream()
                .filter(r -> r.price() >= priceMin && r.price() <= priceMax)
                .filter(r -> req.seats() <= 0 || r.seats() == req.seats())
                .filter(r -> r.fundPercent() >= minFund)
                .filter(r -> !req.needBoost() || r.boostEnabled())
                .filter(r -> r.occupied() < r.seats())
                .sorted(score(req))
                .limit(3)
                .toList();

        if (!fitting.isEmpty()) {
            return new MatchResponse(false, "Подобрали комнату под ваши параметры", fitting);
        }

        // Ничего подходящего — создаём комнату под запрос, чтобы игрок не ждал.
        int seats = req.seats() > 0 ? Math.max(2, Math.min(10, req.seats())) : 5;
        int price = Math.max(10, priceMin);
        if (priceMax != Integer.MAX_VALUE && price > priceMax) {
            price = Math.max(10, priceMax);
        }
        int fundPercent = Math.max(75, Math.min(90, minFund == 0 ? 85 : minFund));

        Room room = roomService.create(
                "Комната под запрос",
                "Создана автоподбором: %d мест · вход %d баллов · фонд %d%%".formatted(seats, price, fundPercent),
                seats, price, fundPercent,
                req.needBoost(), req.needBoost() ? Math.max(10, price / 2) : 0,
                25, 60, "MATCHMAKING");
        // Пара ботов сразу, чтобы комната выглядела живой и таймер стартовал.
        roomService.fillNextBot(room);
        roomService.fillNextBot(room);
        log.info("Matchmaking created room #{} (seats={}, price={})", room.getId(), seats, price);

        List<RoomSummaryDto> result = List.of(roomService.toSummary(room));
        return new MatchResponse(true, "Точных совпадений не нашлось — создали новую комнату под ваши параметры", result);
    }

    /** Чем лучше комната: живая (есть игроки) → ближе по местам → больше заполнена → дешевле вход. */
    private Comparator<RoomSummaryDto> score(MatchRequest req) {
        return Comparator
                .comparingInt((RoomSummaryDto r) -> r.occupied() > 0 ? 0 : 1)
                .thenComparingInt(r -> req.seats() > 0 ? Math.abs(r.seats() - req.seats()) : 0)
                .thenComparingInt(r -> r.seats() - r.occupied())
                .thenComparingInt(RoomSummaryDto::price);
    }
}
