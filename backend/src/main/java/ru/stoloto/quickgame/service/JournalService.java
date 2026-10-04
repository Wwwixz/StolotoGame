package ru.stoloto.quickgame.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.stoloto.quickgame.domain.RoundRecord;
import ru.stoloto.quickgame.dto.DrawParticipant;
import ru.stoloto.quickgame.dto.GameException;
import ru.stoloto.quickgame.dto.JournalRowDto;
import ru.stoloto.quickgame.repo.RoundRecordRepository;
import ru.stoloto.quickgame.service.WinnerService.DrawEntry;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Журнал раундов (сценарий 8 ТЗ): история игр с составом, весами, ГСЧ и распределением
 * балансов. Эксперт может проверить, что результат соответствует backend-логике.
 */
@Service
@RequiredArgsConstructor
public class JournalService {

    private final RoundRecordRepository records;
    private final ObjectMapper mapper;

    /** Proof-of-RNG: участники с весами и накопленными диапазонами — в JSON для журнала. */
    public String writeParticipants(List<DrawEntry> entries, int boostBonusPct) {
        try {
            List<DrawParticipant> list = new ArrayList<>();
            for (DrawEntry e : entries) {
                list.add(new DrawParticipant(
                        e.participant().getName(),
                        e.participant().getPlayerId(),
                        e.participant().isBot(),
                        e.participant().isBoost(),
                        e.participant().getSeatNumber(),
                        e.weight(),
                        e.rangeFrom(),
                        e.rangeTo()));
            }
            return mapper.writeValueAsString(list);
        } catch (Exception e) {
            throw new IllegalStateException("Не удалось сериализовать состав раунда", e);
        }
    }

    /** Завершённые раунды: незавершённую трансляцию в журнале не показываем. */
    public List<JournalRowDto> list() {
        return records.findTop100ByOrderByIdDesc().stream()
                .filter(r -> r.getFinishedAt() > 0)
                .map(this::toDto)
                .toList();
    }

    public JournalRowDto byId(Long id) {
        return records.findById(id).map(this::toDto)
                .orElseThrow(() -> new GameException(GameException.Code.NOT_FOUND, "Раунд #" + id + " не найден"));
    }

    public JournalRowDto toDto(RoundRecord r) {
        return new JournalRowDto(
                r.getId(),
                r.getRoomId(),
                r.getRoomTitle(),
                r.getStartedAt(),
                r.getFinishedAt(),
                r.getSeats(),
                r.getOccupied(),
                r.getEntryPrice(),
                r.getFundPercent(),
                r.getFundTotal(),
                r.getPayout(),
                r.getSystemIncome(),
                r.getBoostIncome(),
                r.getWinnerName(),
                r.getWinnerPlayerId(),
                r.isWinnerIsBot(),
                r.getWinnerBall(),
                Arrays.stream(r.getCombination().split(",")).map(Integer::valueOf).toList(),
                r.getSeed(),
                r.getRngValue(),
                r.getTotalWeight(),
                parseParticipants(r.getParticipantsJson())
        );
    }

    /** История участий игрока: раунды, где он был среди участников. */
    public List<JournalRowDto> roundsOfPlayer(long playerId) {
        List<JournalRowDto> result = new ArrayList<>();
        for (JournalRowDto row : list()) {
            boolean joined = row.participants().stream()
                    .anyMatch(p -> p.playerId() != null && p.playerId() == playerId);
            if (joined) result.add(row);
        }
        return result;
    }

    private List<DrawParticipant> parseParticipants(String json) {
        try {
            return mapper.readValue(json, new TypeReference<List<DrawParticipant>>() {
            });
        } catch (Exception e) {
            return List.of();
        }
    }
}
