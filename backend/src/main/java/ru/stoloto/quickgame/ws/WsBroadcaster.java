package ru.stoloto.quickgame.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Простой JSON-over-WebSocket канал реал-тайма (стек свободный по ТЗ).
 *
 * Клиент подписывается сообщением {"action":"lobby"} или {"action":"room","id":5}
 * и получает push-события:
 *   {"type":"lobby","rooms":[...],"serverTime":...}
 *   {"type":"room","room":{...},"serverTime":...}
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WsBroadcaster extends TextWebSocketHandler {

    public static final String CHANNEL_LOBBY = "lobby";

    private final ObjectMapper mapper;
    private final Map<String, CopyOnWriteArraySet<WebSocketSession>> channels = new ConcurrentHashMap<>();
    private final Map<String, String> sessionChannel = new ConcurrentHashMap<>();

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            Map<?, ?> req = mapper.readValue(message.getPayload(), Map.class);
            String action = String.valueOf(req.get("action"));
            String channel;
            if ("room".equals(action)) {
                Object id = req.get("id");
                if (id == null) return;
                channel = "room:" + id;
            } else if ("lobby".equals(action)) {
                channel = CHANNEL_LOBBY;
            } else {
                return;
            }
            sessionChannel.put(session.getId(), channel);
            channels.computeIfAbsent(channel, k -> new CopyOnWriteArraySet<>()).add(session);
        } catch (Exception e) {
            log.warn("Bad WS message from {}: {}", session.getId(), e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String channel = sessionChannel.remove(session.getId());
        if (channel != null) {
            CopyOnWriteArraySet<WebSocketSession> set = channels.get(channel);
            if (set != null) set.remove(session);
        }
    }

    public void broadcast(String channel, Object payload) {
        CopyOnWriteArraySet<WebSocketSession> set = channels.get(channel);
        if (set == null || set.isEmpty()) return;
        try {
            String text = mapper.writeValueAsString(payload);
            for (WebSocketSession s : set) {
                try {
                    if (s.isOpen()) {
                        synchronized (s) {
                            s.sendMessage(new TextMessage(text));
                        }
                    }
                } catch (IOException e) {
                    log.debug("WS send failed: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("WS serialize failed: {}", e.getMessage());
        }
    }

    public void broadcastRoom(Long roomId, Object roomPayload, Object lobbyPayload) {
        broadcast("room:" + roomId, Map.of("type", "room", "room", roomPayload, "serverTime", System.currentTimeMillis()));
        broadcast(CHANNEL_LOBBY, lobbyPayload);
    }

    public int subscribers(String channel) {
        return channels.getOrDefault(channel, new CopyOnWriteArraySet<>()).size();
    }

    public List<String> channels() {
        return List.copyOf(channels.keySet());
    }
}
