package ru.stoloto.quickgame.dto;

import java.util.List;

/**
 * Карточка комнаты в лобби и в реал-тайме. Все времена — epoch millis,
 * фронт сам считает остаток таймера от phaseEndsAt - serverTime.
 */
public record RoomStateDto(
        Long id,
        String title,
        String description,
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
        long serverTime,
        String source,
        List<ParticipantDto> participants,
        List<Integer> combination,
        String winnerName,
        Long winnerPlayerId,
        boolean winnerIsBot,
        Long payout,
        String seed,
        boolean botFillExpected
) {
}
