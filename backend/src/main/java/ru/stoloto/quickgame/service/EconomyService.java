package ru.stoloto.quickgame.service;

import org.springframework.stereotype.Service;
import ru.stoloto.quickgame.domain.Room;
import ru.stoloto.quickgame.dto.AnalysisNote;
import ru.stoloto.quickgame.dto.EconomyAnalysis;
import ru.stoloto.quickgame.dto.GameException;
import ru.stoloto.quickgame.dto.RoomConfigRequest;

import java.util.ArrayList;
import java.util.List;

/**
 * Анализ конфигурации комнаты: привлекательность для игрока и выгода организатора.
 * Формулы совпадают с frontend/src/economy.ts, но backend — источник истины:
 * явно неудачная конфигурация блокирует сохранение (сценарий 7 ТЗ).
 *
 * Логика расчёта:
 *  pot          = места × цена входа                 — взносы за полный раунд
 *  prizeFund    = pot × процент фонда                — призовой фонд
 *  systemShare  = pot − prizeFund                    — доход организатора с раунда
 *  baseProb     = 1 / места                          — вероятность победы без буста
 *  boostedProb  = baseProb × (1 + бонус буста%)      — вес участника с бустом
 *  evPlayer     = prizeFund × baseProb − цена входа  — ожидание игрока за раунд
 *  boostFairPrice = prizeFund × baseProb × буст%     — справедливая цена буста
 */
@Service
public class EconomyService {

    public EconomyAnalysis analyze(RoomConfigRequest c) {
        int seats = Math.max(2, c.seats());
        long pot = (long) seats * c.entryPrice();
        long prizeFund = Math.round(pot * c.fundPercent() / 100.0);
        long systemShare = pot - prizeFund;
        double baseProb = 1.0 / seats;
        double boostedProb = Math.min(1.0, baseProb * (1 + c.boostBonusPct() / 100.0));
        long evPlayer = Math.round(prizeFund * baseProb) - c.entryPrice();
        double evPct = c.entryPrice() > 0 ? (double) evPlayer / c.entryPrice() : 0;
        long boostFairPrice = Math.round(prizeFund * baseProb * (c.boostBonusPct() / 100.0));
        long evBoosted = Math.round(prizeFund * boostedProb) - c.entryPrice() - c.boostPrice();
        long boostGain = evBoosted - evPlayer;

        List<AnalysisNote> notes = new ArrayList<>();
        boolean blocked = false;

        // --- фонд: слишком щедро организатору нельзя, слишком жадно — игрок уйдёт ---
        if (c.fundPercent() > 97) {
            notes.add(new AnalysisNote(AnalysisNote.BLOCK,
                    "Фонд " + c.fundPercent() + "% — организатор работает в ноль (" +
                            systemShare + " баллов с раунда). Снизьте процент фонда до 97% и меньше"));
            blocked = true;
        } else if (c.fundPercent() > 95) {
            notes.add(new AnalysisNote(AnalysisNote.RISK,
                    "Фонд " + c.fundPercent() + "% — организатор зарабатывает почти ничего (" +
                            systemShare + " за раунд)"));
        } else if (c.fundPercent() < 70) {
            notes.add(new AnalysisNote(AnalysisNote.WARN,
                    "Фонд " + c.fundPercent() + "% — игрок отдаёт больше трети взноса системе, " +
                            "комната может отпугивать"));
        } else {
            notes.add(new AnalysisNote(AnalysisNote.GOOD,
                    "В фонд идёт " + c.fundPercent() + "% взносов — сбалансированное распределение"));
        }

        // --- ожидание игрока: цена эмоции ---
        if (evPct > -0.05) {
            notes.add(new AnalysisNote(AnalysisNote.WARN,
                    "Игрок почти в нуле (" + pct(evPct) + " от цены входа) — комната слишком щедрая, " +
                            "это неконтролируемый рост бонусных обязательств"));
        } else if (evPct < -0.35) {
            notes.add(new AnalysisNote(AnalysisNote.WARN,
                    "Ожидание игрока " + pct(evPct) + " от цены входа — слишком жадно, комната непривлекательна"));
        } else {
            notes.add(new AnalysisNote(AnalysisNote.GOOD,
                    "Ожидание игрока " + pct(evPct) + " от цены входа — игрок платит за эмоцию, комната привлекательна"));
        }

        // --- буст: не должен ломать экономику ---
        if (c.boostEnabled()) {
            if (c.boostBonusPct() > 100) {
                notes.add(new AnalysisNote(AnalysisNote.WARN,
                        "Буст +" + c.boostBonusPct() + "% к весу — чрезмерное влияние на исход, " +
                                "честность механики становится сомнительной"));
            }
            if (boostGain > 0) {
                notes.add(new AnalysisNote(AnalysisNote.RISK,
                        "Буст повышает ожидание игрока на " + boostGain + " — организатор теряет на нём. " +
                                "Поднимите цену буста выше " + (c.boostPrice() + boostGain)));
            } else if (c.boostPrice() > boostFairPrice * 1.5) {
                notes.add(new AnalysisNote(AnalysisNote.WARN,
                        "Буст стоит " + c.boostPrice() + " при справедливой цене ≈" + boostFairPrice +
                                " — игроки вряд ли будут его покупать"));
            } else {
                notes.add(new AnalysisNote(AnalysisNote.GOOD,
                        "Буст по справедливой цене: система зарабатывает " + c.boostPrice() + " с каждой покупки"));
            }
        } else {
            notes.add(new AnalysisNote(AnalysisNote.GOOD, "Буст выключен — механика проще, влияние на экономику нулевое"));
        }

        // --- баланс игрока: не должен отсекать всю VIP-аудиторию ---
        if (c.entryPrice() > 1000) {
            notes.add(new AnalysisNote(AnalysisNote.WARN,
                    "Цена входа " + c.entryPrice() + " — высока для большинства тестовых балансов, " +
                            "комната будет собираться медленно"));
        }

        if (seats <= 3 && c.entryPrice() > 500) {
            notes.add(new AnalysisNote(AnalysisNote.WARN,
                    "Мало мест при дорогом входе: волатильность для игрока очень высокая"));
        }

        String verdict;
        if (blocked) {
            verdict = "BLOCK";
        } else if (notes.stream().anyMatch(n -> n.level().equals(AnalysisNote.RISK))) {
            verdict = "risk";
        } else if (notes.stream().anyMatch(n -> n.level().equals(AnalysisNote.WARN))) {
            verdict = "warn";
        } else {
            verdict = "good";
        }

        return new EconomyAnalysis(seats, c.entryPrice(), c.fundPercent(), pot, prizeFund, systemShare,
                baseProb, boostedProb, evPlayer, evPct, boostFairPrice, boostGain, verdict, blocked, notes);
    }

    public void validateForSave(RoomConfigRequest c) {
        EconomyAnalysis a = analyze(c);
        if (a.blocked()) {
            throw new GameException(GameException.Code.CONFIG_BLOCKED,
                    "Конфигурация явно убыточна для организатора и не может быть сохранена: " +
                            firstBlockText(a.notes()));
        }
    }

    /** Анализ уже существующей комнаты (для сравнения комнат на странице экономики). */
    public EconomyAnalysis analyze(Room room) {
        return analyze(new RoomConfigRequest(room.getTitle(), room.getSeats(), room.getEntryPrice(),
                room.getFundPercent(), room.isBoostEnabled(), room.getBoostPrice(),
                room.getBoostBonusPct(), room.getWaitSeconds(), room.getDescription()));
    }

    private String firstBlockText(List<AnalysisNote> notes) {
        return notes.stream()
                .filter(n -> n.level().equals(AnalysisNote.BLOCK))
                .map(AnalysisNote::text)
                .findFirst()
                .orElse("неизвестная причина");
    }

    private String pct(double v) {
        return Math.round(v * 100) + "%";
    }
}
