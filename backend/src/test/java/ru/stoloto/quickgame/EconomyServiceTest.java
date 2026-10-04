package ru.stoloto.quickgame;

import org.junit.jupiter.api.Test;
import ru.stoloto.quickgame.dto.AnalysisNote;
import ru.stoloto.quickgame.dto.EconomyAnalysis;
import ru.stoloto.quickgame.dto.GameException;
import ru.stoloto.quickgame.dto.RoomConfigRequest;
import ru.stoloto.quickgame.service.EconomyService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EconomyServiceTest {

    private final EconomyService service = new EconomyService();

    private RoomConfigRequest config(int seats, int price, int fund, boolean boost, int boostPrice, int boostPct) {
        return new RoomConfigRequest("Тест", seats, price, fund, boost, boostPrice, boostPct, 60, null);
    }

    @Test
    void classicConfigIsBalanced() {
        EconomyAnalysis a = service.analyze(config(10, 100, 85, true, 50, 25));

        assertThat(a.pot()).isEqualTo(1000);
        assertThat(a.prizeFund()).isEqualTo(850);
        assertThat(a.systemShare()).isEqualTo(150);
        assertThat(a.baseProb()).isEqualTo(0.1);
        assertThat(a.evPlayer()).isEqualTo(-15); // 850 * 0.1 - 100
        assertThat(a.boostFairPrice()).isEqualTo(21); // 850 * 0.1 * 0.25
        assertThat(a.blocked()).isFalse();
        assertThat(a.verdict()).isIn("good", "warn");
    }

    @Test
    void tooGenerousFundIsBlocked() {
        EconomyAnalysis a = service.analyze(config(10, 100, 99, false, 0, 0));
        assertThat(a.blocked()).isTrue();
        assertThat(a.notes()).anyMatch(n -> n.level().equals(AnalysisNote.BLOCK));
        assertThatThrownBy(() -> service.validateForSave(config(10, 100, 99, false, 0, 0)))
                .isInstanceOf(GameException.class)
                .hasMessageContaining("не может быть сохранена");
    }

    @Test
    void losingBoostIsFlaggedAsRisk() {
        // Буст +100% за 5 баллов при фонде 90% — буст выгоден игроку, система теряет.
        EconomyAnalysis a = service.analyze(config(5, 100, 90, true, 5, 100));
        assertThat(a.boostGain()).isPositive();
        assertThat(a.verdict()).isEqualTo("risk");
        assertThat(a.notes()).anyMatch(n -> n.text().contains("организатор теряет"));
    }

    @Test
    void greedyFundWarns() {
        EconomyAnalysis a = service.analyze(config(10, 100, 50, false, 0, 0));
        assertThat(a.notes()).anyMatch(n -> n.level().equals(AnalysisNote.WARN)
                && n.text().contains("отпугивать"));
    }
}
