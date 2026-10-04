package ru.stoloto.quickgame.dto;

public record TransactionDto(
        Long id,
        String type,
        long amount,
        long balanceAfter,
        long reservedAfter,
        String title,
        Long roomId,
        long createdAt
) {
}
