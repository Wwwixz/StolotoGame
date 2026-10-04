package ru.stoloto.quickgame.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private long playerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TxType type;

    /** Со знаком: отрицательное — списание. */
    @Column(nullable = false)
    private long amount;

    @Column(nullable = false)
    private long balanceAfter;

    @Column(nullable = false)
    private long reservedAfter;

    @Column(nullable = false)
    private String title;

    private Long roomId;

    private Long roundId;

    @Column(nullable = false)
    private long createdAt;
}
