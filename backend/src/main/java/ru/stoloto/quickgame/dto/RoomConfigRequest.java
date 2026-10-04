package ru.stoloto.quickgame.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Конфигурация комнаты для админского конфигуратора. */
public record RoomConfigRequest(
        @NotBlank @Size(max = 40) String title,
        @Min(2) @Max(10) int seats,
        @Min(10) @Max(100000) int entryPrice,
        @Min(1) @Max(100) int fundPercent,
        boolean boostEnabled,
        @Min(0) @Max(100000) int boostPrice,
        @Min(0) @Max(500) int boostBonusPct,
        @Min(15) @Max(300) int waitSeconds,
        String description
) {
}
