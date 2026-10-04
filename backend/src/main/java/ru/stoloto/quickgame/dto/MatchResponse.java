package ru.stoloto.quickgame.dto;

import java.util.List;

/** Результат матчмейкинга. created=true — подходящей комнаты не было, система создала новую. */
public record MatchResponse(
        boolean created,
        String message,
        List<RoomSummaryDto> rooms
) {
}
