package com.finman.controller;

import com.finman.dto.request.TestDto;
import com.finman.dto.response.ApiResponse;
import com.finman.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/test")
public class TestController {

    private final JdbcTemplate jdbcTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public TestController(JdbcTemplate jdbcTemplate, RedisTemplate<String, Object> redisTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.redisTemplate = redisTemplate;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkSystemHealth(HttpServletRequest request) {
        Map<String, Object> health = new LinkedHashMap<>();

        // Test PostgreSQL (Port 5432)
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            health.put("postgresql", Map.of(
                "status", result != null && result == 1 ? "UP" : "DOWN",
                "port", 5432,
                "database", "finman_db"
            ));
        } catch (Exception e) {
            health.put("postgresql", Map.of(
                "status", "DOWN",
                "port", 5432,
                "error", e.getMessage()
            ));
        }

        // Test Redis (Port 6379)
        try {
            String pong = redisTemplate.execute((RedisConnection connection) -> connection.ping());
            health.put("redis", Map.of(
                "status", "PONG".equalsIgnoreCase(pong) ? "UP" : "DOWN",
                "port", 6379,
                "ping", String.valueOf(pong)
            ));
        } catch (Exception e) {
            health.put("redis", Map.of(
                "status", "DOWN",
                "port", 6379,
                "error", e.getMessage()
            ));
        }

        health.put("service", "finman-backend");
        health.put("contextPath", "/api");

        return ResponseEntity.ok(ApiResponse.success("Hệ thống PostgreSQL (5432) và Redis (6379) hoạt động bình thường", health, request.getRequestURI()));
    }

    @GetMapping("/error")
    public ResponseEntity<ApiResponse<Void>> triggerBusinessError(HttpServletRequest request) {
        throw new BusinessException("TEST_ERROR", "Test business error triggered for verification");
    }

    @PostMapping("/validation")
    public ResponseEntity<ApiResponse<TestDto>> triggerValidationError(
            @Valid @RequestBody TestDto testDto,
            HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(testDto, request.getRequestURI()));
    }
}
