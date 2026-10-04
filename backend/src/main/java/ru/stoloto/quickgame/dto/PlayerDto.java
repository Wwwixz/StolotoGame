package ru.stoloto.quickgame.dto;

/** Игрок (тестовый пользователь с балансом бонусных баллов). */
public record PlayerDto(
        Long id,
        String name,
        String vipStatus,
        long balance,
        long reserved
) {
}
