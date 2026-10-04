package ru.stoloto.quickgame.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "players")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    /** Тестовый VIP-статус: STANDARD / SILVER / GOLD / PLATINUM */
    @Column(nullable = false)
    private String vipStatus;

    /** Доступные бонусные баллы */
    @Column(nullable = false)
    private long balance;

    /** Зарезервировано под активные комнаты */
    @Column(nullable = false)
    private long reserved;

    @Column(nullable = false)
    private boolean bot;

    @Column(nullable = false)
    private long createdAt;
}
