package ru.stoloto.quickgame.dto;

/** Предупреждение/вывод анализатора конфигурации. */
public record AnalysisNote(String level, String text) {
    public static final String GOOD = "GOOD";
    public static final String WARN = "WARN";
    public static final String RISK = "RISK";
    public static final String BLOCK = "BLOCK";
}
