package ru.stoloto.quickgame.api;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.stoloto.quickgame.dto.JournalRowDto;
import ru.stoloto.quickgame.service.JournalService;

import java.util.List;

/** Журнал раундов для экспертов (сценарий 8 ТЗ): proof-of-RNG и распределение баллов. */
@RestController
@RequestMapping("/api/journal")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journal;

    @GetMapping
    public List<JournalRowDto> list() {
        return journal.list();
    }

    @GetMapping("/{id}")
    public JournalRowDto get(@PathVariable Long id) {
        return journal.byId(id);
    }
}
