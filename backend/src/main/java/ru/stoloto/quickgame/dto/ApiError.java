package ru.stoloto.quickgame.dto;

/** Ошибка API. alternatives — предложения при отказе по балансу (сценарий 6 ТЗ). */
public record ApiError(
        String code,
        String message,
        java.util.List<RoomSummaryDto> alternatives
) {
    public ApiError(String code, String message) {
        this(code, message, java.util.List.of());
    }
}
