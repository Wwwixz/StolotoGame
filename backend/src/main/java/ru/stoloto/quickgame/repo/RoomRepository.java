package ru.stoloto.quickgame.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.stoloto.quickgame.domain.Room;
import ru.stoloto.quickgame.domain.RoomStatus;

import java.util.Collection;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByStatusOrderByIdAsc(RoomStatus status);

    List<Room> findByStatusInOrderByIdAsc(Collection<RoomStatus> statuses);

    long countByStatus(RoomStatus status);
}
