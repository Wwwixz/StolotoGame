package ru.stoloto.quickgame.service;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Параметры движка из application.properties. */
@Getter
@Component
public class GameProperties {

    /** Длительность визуальной трансляции розыгрыша, сек. */
    @Value("${game.draw-seconds:8}")
    private int drawSeconds;

    @Value("${game.engine-tick-ms:400}")
    private long engineTickMs;

    @Value("${game.auto-host:true}")
    private boolean autoHost;

    @Value("${game.auto-host-interval-ms:90000}")
    private long autoHostIntervalMs;

    @Value("${game.max-open-rooms:6}")
    private int maxOpenRooms;
}
