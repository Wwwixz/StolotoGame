package ru.stoloto.quickgame.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.stoloto.quickgame.domain.Player;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findByBotOrderById(boolean bot);

    Optional<Player> findByName(String name);
}
