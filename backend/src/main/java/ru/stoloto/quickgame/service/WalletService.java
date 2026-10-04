package ru.stoloto.quickgame.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.stoloto.quickgame.domain.Player;
import ru.stoloto.quickgame.domain.Room;
import ru.stoloto.quickgame.domain.Transaction;
import ru.stoloto.quickgame.domain.TxType;
import ru.stoloto.quickgame.dto.GameException;
import ru.stoloto.quickgame.repo.PlayerRepository;
import ru.stoloto.quickgame.repo.TransactionRepository;

/**
 * Кошелёк бонусных баллов. В реальном контуре «Столото» этот сервис заменила бы
 * интеграция с балансом ЛК (резерв/списание/начисление через API кошелька),
 * интерфейс операций сохранён тем же: reserve / refund / spend / credit.
 */
@Service
@RequiredArgsConstructor
public class WalletService {

    private final PlayerRepository players;
    private final TransactionRepository transactions;

    @Transactional
    public void reserve(Player player, Room room, long amount) {
        if (player.getBalance() < amount) {
            throw new GameException(GameException.Code.INSUFFICIENT_FUNDS,
                    "Недостаточно бонусных баллов: нужно " + amount + ", доступно " + player.getBalance());
        }
        player.setBalance(player.getBalance() - amount);
        player.setReserved(player.getReserved() + amount);
        save(player, TxType.RESERVE, -amount, room, "Вход в комнату #" + room.getId() + " «" + room.getTitle() + "»");
    }

    @Transactional
    public void refund(Player player, Room room, long amount) {
        player.setReserved(Math.max(0, player.getReserved() - amount));
        player.setBalance(player.getBalance() + amount);
        save(player, TxType.REFUND, amount, room, "Возврат резерва: комната #" + room.getId());
    }

    @Transactional
    public void spend(Player player, Room room, long amount, String title) {
        if (player.getBalance() < amount) {
            throw new GameException(GameException.Code.INSUFFICIENT_FUNDS,
                    "Недостаточно бонусных баллов для покупки: нужно " + amount + ", доступно " + player.getBalance());
        }
        player.setBalance(player.getBalance() - amount);
        save(player, TxType.BOOST, -amount, room, title);
    }

    /** Резерв участника списывается в фонд раунда (баллы уже вычтены при входе). */
    @Transactional
    public void consumeReserved(Player player, Room room, long amount) {
        player.setReserved(Math.max(0, player.getReserved() - amount));
        // Операция уже проведена при входе (RESERVE), повторного списания нет.
    }

    @Transactional
    public void credit(Player player, Room room, long amount, Long roundId) {
        player.setBalance(player.getBalance() + amount);
        Transaction tx = Transaction.builder()
                .playerId(player.getId())
                .type(TxType.WIN)
                .amount(amount)
                .balanceAfter(player.getBalance())
                .reservedAfter(player.getReserved())
                .title("Победа в комнате #" + room.getId() + " «" + room.getTitle() + "»")
                .roomId(room.getId())
                .roundId(roundId)
                .createdAt(System.currentTimeMillis())
                .build();
        transactions.save(tx);
    }

    private void save(Player player, TxType type, long amount, Room room, String title) {
        transactions.save(Transaction.builder()
                .playerId(player.getId())
                .type(type)
                .amount(amount)
                .balanceAfter(player.getBalance())
                .reservedAfter(player.getReserved())
                .title(title)
                .roomId(room.getId())
                .createdAt(System.currentTimeMillis())
                .build());
    }
}
