package ru.stoloto.quickgame.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "participants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    /** null для ботов. */
    private Long playerId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private boolean bot;

    /** Куплен ли буст (один на раунд). */
    @Column(nullable = false)
    private boolean boost;

    /** Номер места в комнате, с 1. Используется как номер шара в лототроне. */
    @Column(nullable = false)
    private int seatNumber;

    @Column(nullable = false)
    private long joinedAt;
}
