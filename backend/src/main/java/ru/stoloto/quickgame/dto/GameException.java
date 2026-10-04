package ru.stoloto.quickgame.dto;

/** Исключение бизнес-логики: уходит клиенту как 400/409 с понятной причиной. */
public class GameException extends RuntimeException {

    public enum Code {
        NOT_FOUND,
        INSUFFICIENT_FUNDS,
        ROOM_FULL,
        ROOM_STARTED,
        ALREADY_JOINED,
        NOT_JOINED,
        BOOST_DISABLED,
        BOOST_ALREADY,
        VALIDATION,
        CONFIG_BLOCKED
    }

    private final Code code;
    private final java.util.List<ru.stoloto.quickgame.dto.RoomSummaryDto> alternatives;

    public GameException(Code code, String message) {
        super(message);
        this.code = code;
        this.alternatives = java.util.List.of();
    }

    public GameException(Code code, String message,
                         java.util.List<ru.stoloto.quickgame.dto.RoomSummaryDto> alternatives) {
        super(message);
        this.code = code;
        this.alternatives = alternatives;
    }

    public Code getCode() {
        return code;
    }

    public java.util.List<ru.stoloto.quickgame.dto.RoomSummaryDto> getAlternatives() {
        return alternatives;
    }
}
