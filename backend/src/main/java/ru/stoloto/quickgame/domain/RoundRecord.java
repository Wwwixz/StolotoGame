package ru.stoloto.quickgame.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "round_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private long roomId;

    @Column(nullable = false)
    private String roomTitle;

    /** Снимок параметров комнаты на момент розыгрыша. */
    @Column(nullable = false)
    private int seats;

    @Column(nullable = false)
    private int entryPrice;

    @Column(nullable = false)
    private int fundPercent;

    @Column(nullable = false)
    private int occupied;

    @Column(nullable = false)
    private long fundTotal;

    @Column(nullable = false)
    private long payout;

    /** Доход системы: (fundTotal - payout) + доход с бустов + невыплаченные призы ботов. */
    @Column(nullable = false)
    private long systemIncome;

    @Column(nullable = false)
    private long boostIncome;

    @Column(nullable = false)
    private String winnerName;

    @Column(nullable = false)
    private boolean winnerIsBot;

    private Long winnerPlayerId;

    /** Выигрышная комбинация "8,12,23,31" + победный номер шара. */
    @Column(nullable = false)
    private String combination;

    private int winnerBall;

    @Column(nullable = false)
    private String seed;

    private Long rngValue;

    private Double totalWeight;

    /** Proof-of-RNG: JSON-массив участников с весами и накопленными диапазонами. */
    @Column(nullable = false, columnDefinition = "text")
    private String participantsJson;

    @Column(nullable = false)
    private long startedAt;

    @Column(nullable = false)
    private long finishedAt;
}
