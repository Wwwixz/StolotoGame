package ru.stoloto.quickgame.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import ru.stoloto.quickgame.domain.Room;
import ru.stoloto.quickgame.domain.RoomStatus;
import ru.stoloto.quickgame.repo.RoomRepository;
import ru.stoloto.quickgame.ws.WsBroadcaster;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Игровой движок: тикает по всем активным комнатам и проводит переходы состояний.
 *
 *   OPEN, участников нет            — ждёт первого игрока (таймер не тикает)
 *   OPEN, таймер истёк, есть места  — за тик добавляется один бот (виден в реал-тайме)
 *   OPEN, таймер истёк, мест нет    — розыгрыш: победитель определяется backend-логикой
 *   RUNNING, таймер истёк           — выплаты, статус FINISHED
 *
 * Для MVP движок живёт в одном экземпляре приложения. Горизонтальное масштабирование
 * описано в README (вынос тика в шедулер с блокировкой комнаты/лидер-эLECTION).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GameEngine {

    private final RoomRepository rooms;
    private final RoomService roomService;
    private final GameProperties props;
    private final WsBroadcaster broadcaster;

    private ScheduledExecutorService executor;

    @EventListener(ApplicationReadyEvent.class)
    public void start() {
        executor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "game-engine");
            t.setDaemon(true);
            return t;
        });
        executor.scheduleAtFixedRate(this::tick, 1000, props.getEngineTickMs(), TimeUnit.MILLISECONDS);
        if (props.isAutoHost()) {
            executor.scheduleAtFixedRate(this::autoHost, props.getAutoHostIntervalMs(),
                    props.getAutoHostIntervalMs(), TimeUnit.MILLISECONDS);
        }
        log.info("Game engine started (tick={}ms, draw={}s, autoHost={})",
                props.getEngineTickMs(), props.getDrawSeconds(), props.isAutoHost());
    }

    public void tick() {
        try {
            List<Room> active = rooms.findByStatusInOrderByIdAsc(List.of(RoomStatus.OPEN, RoomStatus.RUNNING));
            long now = System.currentTimeMillis();
            for (Room room : active) {
                if (room.getStatus() == RoomStatus.OPEN) {
                    tickOpen(room, now);
                } else if (room.getStatus() == RoomStatus.RUNNING && room.getPhaseEndsAt() != null
                        && now >= room.getPhaseEndsAt()) {
                    roomService.settle(room);
                    broadcast(room.getId());
                }
            }
        } catch (Exception e) {
            log.error("Engine tick failed", e);
        }
    }

    private void tickOpen(Room room, long now) {
        // Таймер стартует с первым участником комнаты.
        if (room.getPhaseEndsAt() == null) {
            int occupied = roomService.participantsOf(room).size();
            if (occupied > 0) {
                room.setPhaseEndsAt(now + room.getWaitSeconds() * 1000L);
                rooms.save(room);
                broadcast(room.getId());
            }
            return;
        }
        if (now < room.getPhaseEndsAt()) return;

        // Время вышло: сначала заполняем места ботами (по одному за тик — видно в UI),
        // затем запускаем розыгрыш.
        int occupied = roomService.participantsOf(room).size();
        if (occupied == 0) {
            room.setPhaseEndsAt(null); // все вышли — комната снова ждёт первого игрока
            rooms.save(room);
            broadcast(room.getId());
            return;
        }
        if (occupied < room.getSeats()) {
            if (roomService.fillNextBot(room)) {
                broadcast(room.getId());
            }
            return;
        }
        roomService.startDraw(room);
        broadcast(room.getId());
    }

    /** Демо-режим: поддерживаем в лобби несколько живых комнат, чтобы система дышала. */
    public void autoHost() {
        try {
            long open = rooms.countByStatus(RoomStatus.OPEN);
            if (open >= Math.min(3, props.getMaxOpenRooms())) return;

            String[][] templates = {
                    {"Классическая", "10", "100", "85", "50", "25"},
                    {"Быстрая", "5", "50", "85", "25", "25"},
                    {"Премиум", "8", "200", "80", "100", "30"},
                    {"VIP", "10", "500", "90", "250", "35"},
            };
            String[] t = templates[(int) (open % templates.length)];
            Room room = roomService.create(
                    t[0] + " #" + (100 + (int) (Math.random() * 899)),
                    null,
                    Integer.parseInt(t[1]), Integer.parseInt(t[2]), Integer.parseInt(t[3]),
                    true, Integer.parseInt(t[4]), Integer.parseInt(t[5]), 60, "AUTOHOST");
            roomService.fillNextBot(room);
            roomService.fillNextBot(room);
            log.info("Auto-host created room #{} «{}»", room.getId(), room.getTitle());
            broadcast(room.getId());
        } catch (Exception e) {
            log.error("Auto-host failed", e);
        }
    }

    /** Push обновления комнаты всем подписчикам + свежий лобби-список. */
    public void broadcast(Long roomId) {
        try {
            rooms.findById(roomId).ifPresent(room ->
                    broadcaster.broadcastRoom(room.getId(), roomService.toState(room), lobbyPayload()));
        } catch (Exception e) {
            log.warn("Broadcast failed for room #{}: {}", roomId, e.getMessage());
        }
    }

    private Object lobbyPayload() {
        return java.util.Map.of(
                "type", "lobby",
                "rooms", roomService.lobby(),
                "serverTime", System.currentTimeMillis());
    }
}
