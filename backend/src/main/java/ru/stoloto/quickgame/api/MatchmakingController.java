package ru.stoloto.quickgame.api;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.stoloto.quickgame.dto.MatchRequest;
import ru.stoloto.quickgame.dto.MatchResponse;
import ru.stoloto.quickgame.service.GameEngine;
import ru.stoloto.quickgame.service.MatchmakingService;

/** Автоподбор комнаты по параметрам (сценарий 1 ТЗ). */
@RestController
@RequestMapping("/api/matchmaking")
@RequiredArgsConstructor
public class MatchmakingController {

    private final MatchmakingService matchmaking;
    private final GameEngine engine;

    @PostMapping
    public MatchResponse match(@RequestBody MatchRequest request) {
        MatchResponse response = matchmaking.match(request);
        if (response.created()) {
            engine.broadcast(response.rooms().get(0).id());
        }
        return response;
    }
}
