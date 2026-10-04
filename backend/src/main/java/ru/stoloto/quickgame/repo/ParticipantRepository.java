package ru.stoloto.quickgame.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.stoloto.quickgame.domain.Participant;

import java.util.List;
import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    List<Participant> findByRoomIdOrderByIdAsc(Long roomId);

    Optional<Participant> findByRoomIdAndPlayerId(Long roomId, Long playerId);

    int countByRoomId(Long roomId);

    void deleteByRoomId(Long roomId);
}
