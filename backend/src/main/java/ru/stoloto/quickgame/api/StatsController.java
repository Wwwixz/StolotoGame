package ru.stoloto.quickgame.api;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.stoloto.quickgame.dto.SystemStatsDto;
import ru.stoloto.quickgame.repo.RoundRecordRepository;

/** Системная статистика: фонд, выплаты, доход организатора (управляемая экономика ТЗ). */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final RoundRecordRepository records;

    @GetMapping("/system")
    public SystemStatsDto system() {
        return new SystemStatsDto(
                records.count(),
                records.sumFundTotal(),
                records.sumPayout(),
                records.sumSystemIncome(),
                records.countBotWins()
        );
    }
}
