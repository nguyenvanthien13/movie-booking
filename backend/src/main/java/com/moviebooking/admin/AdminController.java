package com.moviebooking.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminController {
    private final AdminStatsService stats;

    @GetMapping("/api/admin/stats")
    public AdminStatsService.StatsDTO stats(@RequestParam(defaultValue = "14") int days) {
        return stats.stats(Math.min(Math.max(days, 1), 90));
    }
}
