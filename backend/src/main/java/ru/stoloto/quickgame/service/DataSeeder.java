package ru.stoloto.quickgame.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import ru.stoloto.quickgame.domain.Player;
import ru.stoloto.quickgame.domain.Room;
import ru.stoloto.quickgame.repo.PlayerRepository;
import ru.stoloto.quickgame.repo.RoomRepository;

/**
 * Тестовые пользователи, VIP-статусы и балансы бонусных баллов (по ТЗ регистрации
 * не требуются, демо работает на тестовых данных). Стартовые комнаты создаются один раз.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final PlayerRepository players;
    private final RoomRepository rooms;
    private final RoomService roomService;

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        if (players.findByBotOrderById(false).isEmpty()) {
            create("player_4827", "PLATINUM", 50_000);
            create("player_6194", "GOLD", 21_450);
            create("player_7102", "GOLD", 12_450);
            create("player_4831", "SILVER", 5_000);
            create("player_9167", "STANDARD", 3_200);
            create("player_3021", "GOLD", 27_300);
            log.info("Seeded 6 test players");
        }

        if (rooms.count() == 0) {
            Room classic = roomService.create("Классическая",
                    "Классическая комната с оптимальным соотношением цены и выигрыша. Подходит для новичков и опытных игроков.",
                    10, 100, 85, true, 50, 25, 60, "SEED");
            roomService.create("Быстрая",
                    "Ускоренный розыгрыш: раунд занимает меньше минуты.",
                    5, 50, 85, true, 25, 25, 45, "SEED");
            roomService.create("Премиум",
                    "Повышенный призовой фонд и больше участников в раунде.",
                    8, 200, 80, true, 100, 30, 60, "SEED");
            roomService.create("VIP",
                    "Максимальный призовой фонд для крупных ставок.",
                    10, 500, 90, true, 250, 35, 60, "SEED");

            // Немного живой активности: в «Классической» уже сидят игроки-боты,
            // таймер запустится автоматически.
            roomService.fillNextBot(classic);
            roomService.fillNextBot(classic);
            roomService.fillNextBot(classic);
            log.info("Seeded 4 demo rooms");
        }
    }

    private void create(String name, String status, long balance) {
        players.save(Player.builder()
                .name(name)
                .vipStatus(status)
                .balance(balance)
                .reserved(0)
                .bot(false)
                .createdAt(System.currentTimeMillis())
                .build());
    }
}
