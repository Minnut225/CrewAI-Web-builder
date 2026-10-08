package com.finman.service;

import com.finman.dto.ai.AiParseResponse;
import com.finman.repository.AccountRepository;
import com.finman.repository.CategoryRepository;
import com.finman.service.impl.AiServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

class AiServiceTest {

    private AiService aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiServiceImpl(
                null,
                null,
                "dummy_testing_key",
                Mockito.mock(TransactionService.class),
                Mockito.mock(AccountRepository.class),
                Mockito.mock(CategoryRepository.class)
        );
    }

    @Test
    @DisplayName("TC_AI_01: Bóc tách câu chi tiêu tiếng Việt có số tiền k (Ăn bún bò 45k tiền mặt)")
    void testParseBunBoTransaction() {
        AiParseResponse response = aiService.parseTransaction("Ăn bún bò 45k tiền mặt");
        assertNotNull(response);
        assertEquals(45000L, response.amount());
        assertEquals("EXPENSE", response.type());
        assertEquals("Ăn uống", response.categoryName());
        assertEquals("Tiền mặt", response.paymentMethod());
    }

    @Test
    @DisplayName("TC_AI_02: Bóc tách câu thu nhập (Nhận lương tháng này 15 triệu chuyển khoản)")
    void testParseIncomeTransaction() {
        AiParseResponse response = aiService.parseTransaction("Nhận lương tháng này 15 triệu chuyển khoản");
        assertNotNull(response);
        assertEquals(15000000L, response.amount());
        assertEquals("INCOME", response.type());
        assertEquals("Thu nhập", response.categoryName());
        assertEquals("Chuyển khoản", response.paymentMethod());
    }

    @Test
    @DisplayName("TC_AI_03: Bóc tách câu mua sắm laptop số tiền lớn")
    void testParseLargeAmountTransaction() {
        AiParseResponse response = aiService.parseTransaction("Mua laptop 20000000");
        assertNotNull(response);
        assertEquals(20000000L, response.amount());
        assertEquals("EXPENSE", response.type());
        assertEquals("Mua sắm", response.categoryName());
    }

    @Test
    @DisplayName("TC_AI_04: Câu rác hoặc chung chung trả về fallback an toàn")
    void testGarbageInputFallback() {
        AiParseResponse response = aiService.parseTransaction("Xin chào FinMan");
        assertNotNull(response);
        assertTrue(response.amount() > 0 || response.categoryName().equals("Khác"));
    }

    @Test
    @DisplayName("TC_AI_05: Prompt rỗng ném ngoại lệ IllegalArgumentException")
    void testEmptyPromptThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> aiService.parseTransaction("   "));
    }
}
