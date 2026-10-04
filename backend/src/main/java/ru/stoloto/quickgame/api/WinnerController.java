package ru.stoloto.quickgame.api;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.stoloto.quickgame.domain.RoomStatus;
import ru.stoloto.quickgame.dto.DrawParticipant;
import ru.stoloto.quickgame.dto.GameException;
import ru.stoloto.quickgame.repo.RoomRepository;
import ru.stoloto.quickgame.service.RoomService;
import ru.stoloto.quickgame.service.WinnerService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Отдельный endpoint определения победителя (требование ТЗ): принимает параметры
 * комнаты, участников, занятые места и бусты, возвращает победителя, веса и работу
 * ГСЧ. Работает в режиме dry-run — результат нигде не сохраняется.
 */
@RestController
@RequestMapping("/api/winner")
@RequiredArgsConstructor
public class WinnerController {

    private final RoomRepository rooms;
    private final RoomService roomService;
    private final WinnerService winnerService;

    @PostMapping("/preview")
    public Map<String, Object> preview(@RequestBody Map<String, Long> body) {
        Long roomId = body.get("roomId");
        var room = rooms.findById(roomId)
                .orElseThrow(() -> new GameException(GameException.Code.NOT_FOUND, "Комната не найдена"));
        if (room.getStatus() != RoomStatus.OPEN) {
            throw new GameException(GameException.Code.ROOM_STARTED, "Preview доступен только для открытых комнат");
        }

        var ps = roomService.participantsOf(room);
        if (ps.isEmpty()) {
            throw new GameException(GameException.Code.VALIDATION, "В комнате пока нет участников");
        }

        WinnerService.DrawResult draw = winnerService.draw(ps, room.getBoostBonusPct());
        List<DrawParticipant> parts = new ArrayList<>();
        for (WinnerService.DrawEntry e : draw.entries()) {
            parts.add(new DrawParticipant(e.participant().getName(), e.participant().getPlayerId(),
                    e.participant().isBot(), e.participant().isBoost(), e.participant().getSeatNumber(),
                    e.weight(), e.rangeFrom(), e.rangeTo()));
        }

        long fundTotal = (long) ps.size() * room.getEntryPrice();
        return Map.of(
                "roomId", roomId,
                "winnerName", draw.winner().getName(),
                "winnerBall", draw.winner().getSeatNumber(),
                "totalWeight", draw.totalWeight(),
                "rngValue", draw.rngValue(),
                "seed", draw.seed(),
                "combination", draw.combination(),
                "fundTotal", fundTotal,
                "payout", Math.round(fundTotal * room.getFundPercent() / 100.0),
                "participants", parts
        );
    }
}
