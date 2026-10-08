package com.finman;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class FinManApplicationTests {

    @Test
    void contextLoads() {
        // Smoke test to verify Spring context loads successfully
    }

}