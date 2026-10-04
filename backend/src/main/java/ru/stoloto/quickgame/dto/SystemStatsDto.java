package ru.stoloto.quickgame.dto;

/** Системная статистика для страницы баланса / панели организатора. */
public record SystemStatsDto(
        long roundsPlayed,
        long totalFund,
        long totalPayouts,
        long systemIncome,
        long botWins
) {
}
