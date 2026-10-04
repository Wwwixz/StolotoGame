package ru.stoloto.quickgame.service;

import org.springframework.stereotype.Service;
import ru.stoloto.quickgame.domain.Participant;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Определение победителя (требование ТЗ: отдельный backend-модуль/endpoint).
 *
 * Механика прозрачна и объяснима пользователю:
 *   вес участника = 1 (+ бонус буста, если куплен);
 *   чем больше занято мест за игроком, тем больше у него «шансов» — в MVP один игрок
 *   занимает одно место, поэтому вес базовый равен 1;
 *   ГСЧ — SecureRandom, раунд логируется с сидом, значением ГСЧ, суммарным весом
 *   и накопленными диапазонами каждого участника (proof-of-RNG в журнале).
 */
@Service
public class WinnerService {

    public record DrawResult(
            Participant winner,
            double totalWeight,
            long rngValue,
            String seed,
            List<Integer> combination,
            List<DrawEntry> entries
    ) {
    }

    public record DrawEntry(
            Participant participant,
            double weight,
            double rangeFrom,
            double rangeTo
    ) {
    }

    private final SecureRandom random = new SecureRandom();

    public double weightOf(Participant p, int boostBonusPct) {
        return p.isBoost() ? 1.0 + boostBonusPct / 100.0 : 1.0;
    }

    /**
     * Розыгрыш: строит диапазоны [rangeFrom, rangeTo) по весам, кидает ГСЧ
     * и находит победителя. rngValue сохраняется в тысячных долях totalWeight.
     */
    public DrawResult draw(List<Participant> participants, int boostBonusPct) {
        if (participants.isEmpty()) {
            throw new IllegalStateException("Нельзя провести розыгрыш без участников");
        }

        List<DrawEntry> entries = new ArrayList<>(participants.size());
        double acc = 0;
        for (Participant p : participants) {
            double w = weightOf(p, boostBonusPct);
            entries.add(new DrawEntry(p, w, acc, acc + w));
            acc += w;
        }
        double total = acc;

        double roll = random.nextDouble() * total;
        Participant winner = entries.stream()
                .filter(e -> roll >= e.rangeFrom() && roll < e.rangeTo())
                .map(DrawEntry::participant)
                .findFirst()
                .orElse(entries.get(entries.size() - 1).participant());

        long rngValue = Math.round(roll * 1000);
        String seed = String.format("%08x", random.nextInt());

        return new DrawResult(winner, total, rngValue, seed, combination(4, 36), entries);
    }

    /** Выигрышная комбинация: count уникальных чисел от 1 до maxInclusive. */
    public List<Integer> combination(int count, int maxInclusive) {
        Set<Integer> set = new LinkedHashSet<>();
        while (set.size() < count) {
            set.add(random.nextInt(maxInclusive) + 1);
        }
        return new ArrayList<>(set);
    }
}
