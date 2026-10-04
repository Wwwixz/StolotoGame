package ru.stoloto.quickgame.dto;

/** Один участник в proof-of-RNG журнала: вес и накопленный диапазон розыгрыша. */
public record DrawParticipant(
        String name,
        Long playerId,
        boolean bot,
        boolean boost,
        int ball,
        double weight,
        double rangeFrom,
        double rangeTo
) {
}
