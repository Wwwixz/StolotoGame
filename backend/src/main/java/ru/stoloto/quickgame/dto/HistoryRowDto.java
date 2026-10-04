package ru.stoloto.quickgame.dto;

/** Строка истории участий игрока. */
public record HistoryRowDto(
        Long roundId,
        long roomId,
        String roomTitle,
        long finishedAt,
        boolean win,
        long amount,
        long prize
) {
}
