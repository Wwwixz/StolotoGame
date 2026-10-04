package ru.stoloto.quickgame.dto;

/** Запрос автоподбора комнаты. */
public record MatchRequest(
        Long playerId,
        int seats,
        Integer priceMin,
        Integer priceMax,
        Integer minFundPercent,
        boolean needBoost
) {
}
