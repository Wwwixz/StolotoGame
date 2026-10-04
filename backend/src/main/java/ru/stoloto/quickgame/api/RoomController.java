package ru.stoloto.quickgame.api;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.stoloto.quickgame.dto.RoomStateDto;
import ru.stoloto.quickgame.dto.RoomSummaryDto;
import ru.stoloto.quickgame.service.GameEngine;
import ru.stoloto.quickgame.service.RoomService;

import java.util.List;
import java.util.Map;

/** Комнаты: лобби, состояние, вход с резервом, выход, покупка буста. */
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final GameEngine engine;

    @GetMapping
    public List<RoomSummaryDto> lobby() {
        return roomService.lobby();
    }

    @GetMapping("/{id}")
    public RoomStateDto state(@PathVariable Long id) {
        return roomService.toState(roomService.getRoom(id));
    }

    @PostMapping("/{id}/join")
    public RoomStateDto join(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        RoomStateDto state = roomService.join(id, body.get("playerId"));
        engine.broadcast(id);
        return state;
    }

    @PostMapping("/{id}/leave")
    public RoomStateDto leave(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        RoomStateDto state = roomService.leave(id, body.get("playerId"));
        engine.broadcast(id);
        return state;
    }

    @PostMapping("/{id}/boost")
    public RoomStateDto boost(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        RoomStateDto state = roomService.buyBoost(id, body.get("playerId"));
        engine.broadcast(id);
        return state;
    }
}
