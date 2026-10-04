package ru.stoloto.quickgame.dto;

import java.util.List;

/**
 * Результат анализа конфигурации комнаты: насколько она привлекательна
 * для игрока и выгодна организатору. Те же формулы, что и на фронте,
 * но backend — источник истины (сохранение явно неудачной конфигурации блокируется).
 */
public record EconomyAnalysis(
        int seats,
        int entryPrice,
        int fundPercent,
        long pot,
        long prizeFund,
        long systemShare,
        double baseProb,
        double boostedProb,
        long evPlayer,
        double evPct,
        long boostFairPrice,
        long boostGain,
        String verdict,
        boolean blocked,
        List<AnalysisNote> notes
) {
}
