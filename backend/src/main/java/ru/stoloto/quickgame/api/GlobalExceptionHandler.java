package ru.stoloto.quickgame.api;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.stoloto.quickgame.dto.ApiError;
import ru.stoloto.quickgame.dto.GameException;

/** Понятные ошибки API: отказ по балансу уже несёт альтернативы (сценарий 6 ТЗ). */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(GameException.class)
    public ResponseEntity<ApiError> game(GameException e) {
        return ResponseEntity.status(statusOf(e.getCode()))
                .body(new ApiError(e.getCode().name(), e.getMessage(), e.getAlternatives()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .findFirst()
                .orElse("Некорректные параметры");
        return ResponseEntity.badRequest().body(new ApiError("VALIDATION", msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> any(Exception e) {
        log.error("Unhandled error", e);
        return ResponseEntity.status(500).body(new ApiError("INTERNAL", "Внутренняя ошибка сервера"));
    }

    private HttpStatus statusOf(GameException.Code code) {
        return switch (code) {
            case NOT_FOUND -> HttpStatus.NOT_FOUND;
            case ROOM_FULL, ROOM_STARTED, ALREADY_JOINED, NOT_JOINED, BOOST_ALREADY -> HttpStatus.CONFLICT;
            default -> HttpStatus.BAD_REQUEST;
        };
    }
}
