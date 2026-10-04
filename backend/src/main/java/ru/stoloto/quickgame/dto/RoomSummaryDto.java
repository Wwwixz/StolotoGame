package ru.stoloto.quickgame.dto;

/** Комната в лобби (облегчённая, без состава). */
public record RoomSummaryDto(
        Long id,
        String title,
        String status,
        int seats,
        int occupied,
        int price,
        int fundPercent,
        long currentFund,
        long projectedFund,
        boolean boostEnabled,
        int boostPrice,
        int boostPercent,
        int waitSeconds,
        Long phaseEndsAt,
        long serverTime
) {
}
