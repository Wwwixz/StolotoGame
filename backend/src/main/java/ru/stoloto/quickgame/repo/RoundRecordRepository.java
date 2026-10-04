package ru.stoloto.quickgame.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.stoloto.quickgame.domain.RoundRecord;

import java.util.List;
import java.util.Optional;

public interface RoundRecordRepository extends JpaRepository<RoundRecord, Long> {

    List<RoundRecord> findTop100ByOrderByIdDesc();

    Optional<RoundRecord> findTop1ByRoomIdOrderByIdDesc(Long roomId);

    @Query("select coalesce(sum(r.fundTotal), 0) from RoundRecord r")
    long sumFundTotal();

    @Query("select coalesce(sum(r.payout), 0) from RoundRecord r")
    long sumPayout();

    @Query("select coalesce(sum(r.systemIncome), 0) from RoundRecord r")
    long sumSystemIncome();

    @Query("select count(r) from RoundRecord r where r.winnerIsBot = true")
    long countBotWins();
}
