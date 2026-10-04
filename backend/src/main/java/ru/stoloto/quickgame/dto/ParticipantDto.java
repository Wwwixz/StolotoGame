package ru.stoloto.quickgame.dto;

/** Участник комнаты в API. */
public record ParticipantDto(
        Long id,
        Long playerId,
        String name,
        boolean bot,
        boolean boost,
        int seat,
        double weight
) {
}
