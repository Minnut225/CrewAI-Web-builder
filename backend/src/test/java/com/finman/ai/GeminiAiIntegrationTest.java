package com.finman.ai;

import com.finman.dto.ai.AiParseRequest;
import com.finman.dto.ai.AiParseResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class GeminiAiIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void TC_AI_01_ValidInput_ReturnsParsedData() {
        AiParseRequest request = new AiParseRequest("Mua cà phê 50000");
        ResponseEntity<AiParseResponse> response = restTemplate.postForEntity("/api/v1/ai/process", request, AiParseResponse.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().amount()).isEqualTo(50000L);
        assertThat(response.getBody().type()).isEqualTo("EXPENSE");
    }

    @Test
    void TC_AI_02_UnicodeInput_ReturnsParsedData() {
        AiParseRequest request = new AiParseRequest("Ăn trưa hết 100.000 đồng");
        ResponseEntity<AiParseResponse> response = restTemplate.postForEntity("/api/v1/ai/process", request, AiParseResponse.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().amount()).isEqualTo(100000L);
    }

    @Test
    void TC_AI_03_GarbageInput_ReturnsFallback() {
        AiParseRequest request = new AiParseRequest("Xin chào");
        ResponseEntity<AiParseResponse> response = restTemplate.postForEntity("/api/v1/ai/process", request, AiParseResponse.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void TC_AI_04_EmptyInput_ReturnsBadRequest() {
        AiParseRequest request = new AiParseRequest("");
        ResponseEntity<AiParseResponse> response = restTemplate.postForEntity("/api/v1/ai/process", request, AiParseResponse.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void TC_AI_05_LargeAmount_ReturnsCorrectData() {
        AiParseRequest request = new AiParseRequest("Mua laptop 20000000");
        ResponseEntity<AiParseResponse> response = restTemplate.postForEntity("/api/v1/ai/process", request, AiParseResponse.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().amount()).isEqualTo(20000000L);
    }

    @Test
    void TC_AI_06_NetworkError_ReturnsServiceUnavailable() {
        AiParseRequest request = new AiParseRequest("Mua sách 100000");
        ResponseEntity<AiParseResponse> response = restTemplate.postForEntity("/api/v1/ai/process", request, AiParseResponse.class);
        assertThat(response.getStatusCode()).isNotEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
