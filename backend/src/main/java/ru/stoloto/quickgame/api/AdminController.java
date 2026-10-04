package ru.stoloto.quickgame.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.stoloto.quickgame.dto.EconomyAnalysis;
import ru.stoloto.quickgame.dto.RoomConfigRequest;
import ru.stoloto.quickgame.dto.RoomStateDto;
import ru.stoloto.quickgame.dto.RoomSummaryDto;
import ru.stoloto.quickgame.service.EconomyService;
import ru.stoloto.quickgame.service.GameEngine;
import ru.stoloto.quickgame.service.RoomService;

import java.util.List;
import java.util.Map;

/**
 * Конфигуратор комнат (сценарии 5 и 7 ТЗ): создание комнат, предпросмотр анализа
 * экономики, закрытие комнат. Явно убыточная конфигурация не сохраняется.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RoomService roomService;
    private final EconomyService economy;
    private final GameEngine engine;

    @PostMapping("/rooms/analyze")
    public EconomyAnalysis analyze(@Valid @RequestBody RoomConfigRequest config) {
        return economy.analyze(config);
    }

    @PostMapping("/rooms")
    public RoomStateDto create(@Valid @RequestBody RoomConfigRequest config) {
        economy.validateForSave(config);
        var room = roomService.create(config.title(), config.description(), config.seats(),
                config.entryPrice(), config.fundPercent(), config.boostEnabled(),
                config.boostEnabled() ? config.boostPrice() : 0, config.boostBonusPct(),
                config.waitSeconds(), "ADMIN");
        engine.broadcast(room.getId());
        return roomService.toState(room);
    }

    @PostMapping("/rooms/{id}/close")
    public Map<String, String> close(@PathVariable Long id) {
        roomService.closeByAdmin(id);
        engine.broadcast(id);
        return Map.of("status", "closed");
    }

    /** Сравнение открытых комнат по экономике — для страницы аналитики. */
    @GetMapping("/economy/compare")
    public List<Map<String, Object>> compare() {
        return roomService.lobby().stream()
                .<Map<String, Object>>map(s -> {
                    var room = roomService.getRoom(s.id());
                    return Map.of("room", s, "analysis", (Object) economy.analyze(room));
                })
                .toList();
    }
}
