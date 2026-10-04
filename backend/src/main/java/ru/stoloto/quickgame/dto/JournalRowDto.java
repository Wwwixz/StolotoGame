package ru.stoloto.quickgame.dto;

import java.util.List;

/** Подробный журнал раунда: состав, веса, работа ГСЧ и распределение баллов. */
public record JournalRowDto(
        Long id,
        long roomId,
        String roomTitle,
        long startedAt,
        long finishedAt,
        int seats,
        int occupied,
        int entryPrice,
        int fundPercent,
        long fundTotal,
        long payout,
        long systemIncome,
        long boostIncome,
        String winnerName,
        Long winnerPlayerId,
        boolean winnerIsBot,
        int winnerBall,
        List<Integer> combination,
        String seed,
        Long rngValue,
        Double totalWeight,
        List<DrawParticipant> participants
) {
}
