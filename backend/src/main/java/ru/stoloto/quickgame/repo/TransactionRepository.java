package ru.stoloto.quickgame.repo;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.stoloto.quickgame.domain.Transaction;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByPlayerIdOrderByIdDesc(long playerId, Pageable pageable);
}
