package ru.stoloto.quickgame.api;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import ru.stoloto.quickgame.domain.Player;
import ru.stoloto.quickgame.domain.Transaction;
import ru.stoloto.quickgame.dto.GameException;
import ru.stoloto.quickgame.dto.HistoryRowDto;
import ru.stoloto.quickgame.dto.PlayerDto;
import ru.stoloto.quickgame.dto.TransactionDto;
import ru.stoloto.quickgame.repo.PlayerRepository;
import ru.stoloto.quickgame.repo.TransactionRepository;
import ru.stoloto.quickgame.service.JournalService;

import java.util.List;

/** Тестовые игроки, их балансы, операции и история участий. */
@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerRepository players;
    private final TransactionRepository transactions;
    private final JournalService journal;

    @GetMapping
    public List<PlayerDto> list() {
        return players.findByBotOrderById(false).stream()
                .map(PlayerController::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public PlayerDto get(@PathVariable Long id) {
        return toDto(player(id));
    }

    @GetMapping("/{id}/transactions")
    public List<TransactionDto> tx(@PathVariable Long id) {
        player(id);
        return transactions.findByPlayerIdOrderByIdDesc(id, PageRequest.of(0, 50)).stream()
                .map(t -> new TransactionDto(t.getId(), t.getType().name(), t.getAmount(),
                        t.getBalanceAfter(), t.getReservedAfter(), t.getTitle(), t.getRoomId(), t.getCreatedAt()))
                .toList();
    }

    @GetMapping("/{id}/history")
    public List<HistoryRowDto> history(@PathVariable Long id) {
        player(id);
        return journal.roundsOfPlayer(id).stream()
                .map(r -> {
                    boolean win = r.winnerPlayerId() != null && r.winnerPlayerId() == id;
                    // Чистый итог раунда для игрока: победа — приз минус вход; поражение — вход.
                    long amount = win ? r.payout() - r.entryPrice() : -r.entryPrice();
                    return new HistoryRowDto(r.id(), r.roomId(), r.roomTitle(), r.finishedAt(), win, amount,
                            win ? r.payout() : 0);
                })
                .toList();
    }

    private Player player(Long id) {
        return players.findById(id)
                .orElseThrow(() -> new GameException(GameException.Code.NOT_FOUND, "Игрок #" + id + " не найден"));
    }

    private static PlayerDto toDto(Player p) {
        return new PlayerDto(p.getId(), p.getName(), p.getVipStatus(), p.getBalance(), p.getReserved());
    }
}
