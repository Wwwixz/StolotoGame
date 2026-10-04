package ru.stoloto.quickgame.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    /** Максимум 10 мест по ТЗ. */
    @Column(nullable = false)
    private int seats;

    /** Цена входа в бонусных баллах — резервируется при входе. */
    @Column(nullable = false)
    private int entryPrice;

    /** Доля взносов, идущая в призовой фонд (0..100). */
    @Column(nullable = false)
    private int fundPercent;

    @Column(nullable = false)
    private boolean boostEnabled;

    /** Цена буста в баллах (списывается с доступного баланса, в фонд не попадает). */
    @Column(nullable = false)
    private int boostPrice;

    /** Насколько буст увеличивает вес участника при выборе победителя, %. */
    @Column(nullable = false)
    private int boostBonusPct;

    /** Длительность таймера ожидания, сек. */
    @Column(nullable = false)
    private int waitSeconds;

    /** Источник комнаты: SEED / ADMIN / MATCHMAKING / AUTOHOST. */
    @Column(nullable = false)
    private String source;

    private Long phaseEndsAt;

    @Column(nullable = false)
    private long createdAt;

    // ---- результаты розыгрыша (заполняются при переходе OPEN -> RUNNING) ----

    private Long winnerParticipantId;

    /** Сумма взносов в комнате на момент розыгрыша. */
    private long fundTotal;

    /** Выплата победителю: fundTotal * fundPercent%. Боту не начисляется. */
    private long payout;

    /** Выигрышная комбинация для фронта: 4 числа из 36 + номер шара победителя. */
    private String combination;

    /** Hex-строка сида раунда для журнала (прозрачность результата). */
    private String seed;

    /** Значение ГСЧ (тысячные доли от totalWeight) и суммарный вес — proof-of-RNG. */
    private Long rngValue;

    private Double totalWeight;

    @Column(nullable = false)
    private boolean settled;
}
