package com.finman.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finman.dto.ai.AiConfirmRequest;
import com.finman.dto.ai.AiInsightsRequest;
import com.finman.dto.ai.AiInsightsResponse;
import com.finman.dto.ai.AiParseResponse;
import com.finman.dto.request.TransactionCreateRequest;
import com.finman.dto.response.TransactionResponse;
import com.finman.entity.Account;
import com.finman.entity.Category;
import com.finman.repository.AccountRepository;
import com.finman.repository.CategoryRepository;
import com.finman.service.AiService;
import com.finman.service.TransactionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class AiServiceImpl implements AiService {

    private final RestClient geminiRestClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final TransactionService transactionService;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;

    public AiServiceImpl(
            RestClient geminiRestClient,
            ObjectMapper objectMapper,
            @Value("${gemini.api.key:}") String apiKey,
            TransactionService transactionService,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository
    ) {
        this.geminiRestClient = geminiRestClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.transactionService = transactionService;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public AiParseResponse parseTransaction(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Prompt cannot be blank");
        }

        if (apiKey == null || apiKey.isBlank() || apiKey.equals("AIzaSyDummyKeyForBuildOrTestingOnly") || apiKey.contains("dummy")) {
            log.info("Gemini API key not configured or dummy. Using robust heuristic parser for prompt: {}", prompt);
            return parseHeuristic(prompt);
        }

        try {
            String systemInstruction = "You are a personal finance assistant. Parse the Vietnamese natural language prompt into a strict JSON object with NO markdown formatting, NO backticks. Fields required: amount (integer Long in VND, e.g. 45000), type (strictly 'EXPENSE' or 'INCOME'), categoryName (string, e.g. 'Ăn uống', 'Lương', 'Mua sắm', 'Di chuyển'), description (string), paymentMethod (string, e.g. 'Tiền mặt', 'Chuyển khoản', 'Thẻ'), confidence (double between 0 and 1).";

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of(
                        "parts", List.of(
                            Map.of("text", systemInstruction + "\n\nPrompt: " + prompt)
                        )
                    )
                )
            );

            String responseString = geminiRestClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseString == null) {
                return parseHeuristic(prompt);
            }

            JsonNode rootNode = objectMapper.readTree(responseString);
            JsonNode textNode = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0).path("text");

            if (textNode.isMissingNode()) {
                return parseHeuristic(prompt);
            }

            String rawJson = textNode.asText().trim();
            if (rawJson.startsWith("```json")) {
                rawJson = rawJson.substring(7);
            } else if (rawJson.startsWith("```")) {
                rawJson = rawJson.substring(3);
            }
            if (rawJson.endsWith("```")) {
                rawJson = rawJson.substring(0, rawJson.length() - 3);
            }
            rawJson = rawJson.trim();

            JsonNode parsedObj = objectMapper.readTree(rawJson);
            Long amount = parsedObj.path("amount").asLong(0L);
            String type = parsedObj.path("type").asText("EXPENSE");
            String categoryName = parsedObj.path("categoryName").asText("Khác");
            String description = parsedObj.path("description").asText(prompt);
            String paymentMethod = parsedObj.path("paymentMethod").asText("Tiền mặt");
            Double confidence = parsedObj.path("confidence").asDouble(0.95);

            return new AiParseResponse(amount, type, categoryName, description, paymentMethod, confidence, prompt);
        } catch (Exception e) {
            log.warn("Gemini API call or JSON parsing failed ({}), falling back to heuristic: {}", e.getMessage(), prompt);
            return parseHeuristic(prompt);
        }
    }

    @Override
    public AiInsightsResponse generateInsights(AiInsightsRequest request) {
        long income = request.monthlyIncome() != null ? request.monthlyIncome() : 0L;
        long expense = request.monthlyExpense() != null ? request.monthlyExpense() : 0L;
        long savings = income - expense;
        int expenseRatio = income > 0 ? (int) Math.round(((double) expense / income) * 100) : 0;

        NumberFormat vnFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        String incomeFormatted = vnFormat.format(income);
        String expenseFormatted = vnFormat.format(expense);
        String savingsFormatted = vnFormat.format(savings);

        String healthScore;
        String advice;
        List<String> keyObservations;

        if (expenseRatio > 100) {
            healthScore = "Báo động đỏ (Thâm hụt " + expenseRatio + "%)";
            advice = "Chi tiêu đang vượt quá thu nhập tháng! Hãy rà soát lại các khoản chi không thiết yếu ngay lập tức.";
            keyObservations = List.of(
                    "Tỷ lệ chi tiêu/thu nhập đạt mức nguy hiểm: " + expenseRatio + "%",
                    "Thâm hụt tài chính: " + vnFormat.format(Math.abs(savings)),
                    "Cần cắt giảm chi tiêu giải trí và ăn ngoài để cân bằng dòng tiền"
            );
        } else if (expenseRatio >= 80) {
            healthScore = "Cảnh báo (Chi tiêu " + expenseRatio + "%)";
            advice = "Bạn đang chi tiêu gần hết thu nhập. Hãy cân nhắc quy tắc 50/30/20 để tối ưu tiết kiệm ít nhất 20%.";
            keyObservations = List.of(
                    "Tỷ lệ chi tiêu " + expenseRatio + "% nằm trong vùng cần lưu ý",
                    "Số dư tiết kiệm còn lại: " + savingsFormatted,
                    "Hãy tăng cường tích lũy cho quỹ dự phòng khẩn cấp"
            );
        } else {
            healthScore = "Lành mạnh (Tiết kiệm tốt " + (100 - expenseRatio) + "%)";
            advice = "Tuyệt vời! Bạn đang kiểm soát chi tiêu rất tốt. Khoản tiết kiệm " + savingsFormatted + " có thể đầu tư sinh lời.";
            keyObservations = List.of(
                    "Tỷ lệ chi tiêu ở mức tối ưu: " + expenseRatio + "%",
                    "Thặng dư tích lũy: " + savingsFormatted,
                    "Kỷ luật tài chính tốt, sẵn sàng cho các mục tiêu dài hạn"
            );
        }

        String combined = String.format("Tình trạng: %s. Lời khuyên: %s. Phân tích: %s (Thu: %s, Chi: %s, Tiết kiệm: %s)",
                healthScore, advice, String.join("; ", keyObservations), incomeFormatted, expenseFormatted, savingsFormatted);

        return new AiInsightsResponse(true, combined);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransactionResponse confirmTransaction(Long userId, AiConfirmRequest request) {
        String type = (request.type() != null && request.type().equalsIgnoreCase("INCOME")) ? "INCOME" : "EXPENSE";
        Long amount = request.amount();

        // 1. Resolve Account
        Long accountId = request.accountId();
        if (accountId == null) {
            String accName = request.accountName();
            List<Account> userAccounts = accountRepository.findByUserIdAndIsArchivedFalse(userId);
            if (!userAccounts.isEmpty()) {
                if (accName != null && !accName.isBlank()) {
                    String normName = accName.toLowerCase();
                    Optional<Account> matched = userAccounts.stream()
                            .filter(a -> a.getName().toLowerCase().contains(normName) || normName.contains(a.getName().toLowerCase()))
                            .findFirst();
                    accountId = matched.map(Account::getId).orElse(userAccounts.get(0).getId());
                } else {
                    accountId = userAccounts.get(0).getId();
                }
            } else {
                throw new IllegalStateException("Người dùng chưa có tài khoản/ví nào khả dụng.");
            }
        }

        // 2. Resolve Category
        Long categoryId = request.categoryId();
        if (categoryId == null) {
            String catName = request.categoryName();
            List<Category> categories = categoryRepository.findByUserIdIsNullOrUserId(userId);
            if (!categories.isEmpty()) {
                if (catName != null && !catName.isBlank()) {
                    String normCat = catName.toLowerCase();
                    Optional<Category> matched = categories.stream()
                            .filter(c -> c.getName().toLowerCase().contains(normCat) || normCat.contains(c.getName().toLowerCase()))
                            .findFirst();
                    categoryId = matched.map(Category::getId).orElse(categories.get(0).getId());
                } else {
                    categoryId = categories.get(0).getId();
                }
            } else {
                throw new IllegalStateException("Không tìm thấy danh mục giao dịch phù hợp.");
            }
        }

        // 3. Resolve Date
        LocalDate txnDate = LocalDate.now();
        if (request.transactionDate() != null && !request.transactionDate().isBlank()) {
            try {
                txnDate = LocalDate.parse(request.transactionDate().substring(0, 10));
            } catch (Exception ignored) {}
        }

        // 4. Resolve Note
        String note = request.note();
        if (note == null || note.isBlank()) {
            note = request.description();
        }
        if (note == null || note.isBlank()) {
            note = "Giao dịch tạo bởi Trợ lý AI";
        }

        // 5. Execute via TransactionService for Zero-Float and ACID Account Balance integrity
        TransactionCreateRequest txnReq = new TransactionCreateRequest(
                accountId,
                categoryId,
                amount,
                type,
                txnDate,
                note
        );

        return transactionService.createTransaction(userId, txnReq);
    }

    private AiParseResponse parseHeuristic(String prompt) {
        String lower = prompt.toLowerCase();
        long amount = 50000L;

        // Pattern matching amounts like: 45k, 45.000, 45,000, 150 nghin, 15 trieu
        Pattern pattern = Pattern.compile("(\\d+[\\d.,]*)\\s*(k|nghìn|ngàn|đ|vnd|triệu|tr)?", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            String numStr = matcher.group(1).replaceAll("[,.]", "");
            try {
                long parsed = Long.parseLong(numStr);
                String unit = matcher.group(2) != null ? matcher.group(2).toLowerCase() : "";
                if (unit.contains("k") || unit.contains("nghìn") || unit.contains("ngàn")) {
                    parsed *= 1000L;
                } else if (unit.contains("triệu") || unit.contains("tr")) {
                    parsed *= 1000000L;
                }
                amount = parsed;
            } catch (NumberFormatException ignored) {}
        }

        boolean isIncome = lower.contains("lương") || lower.contains("thu") || lower.contains("nhận") || lower.contains("thưởng") || lower.contains("bán");
        String type = isIncome ? "INCOME" : "EXPENSE";

        String categoryName = "Khác";
        if (lower.contains("ăn") || lower.contains("phở") || lower.contains("cơm") || lower.contains("trưa") || lower.contains("quán") || lower.contains("coffee") || lower.contains("cafe") || lower.contains("bún") || lower.contains("cà phê")) {
            categoryName = "Ăn uống";
        } else if (lower.contains("xăng") || lower.contains("xe") || lower.contains("grab") || lower.contains("taxi")) {
            categoryName = "Di chuyển";
        } else if (lower.contains("lương")) {
            categoryName = "Thu nhập";
        } else if (lower.contains("mua") || lower.contains("shopee") || lower.contains("áo") || lower.contains("quần") || lower.contains("laptop") || lower.contains("sách")) {
            categoryName = "Mua sắm";
        }

        String paymentMethod = "Tiền mặt";
        if (lower.contains("vcb") || lower.contains("vietcombank") || lower.contains("techcombank") || lower.contains("momo") || lower.contains("chuyển khoản") || lower.contains("ck")) {
            paymentMethod = "Chuyển khoản";
        } else if (lower.contains("thẻ") || lower.contains("visa") || lower.contains("mastercard")) {
            paymentMethod = "Thẻ tín dụng";
        }

        return new AiParseResponse(
                amount,
                type,
                categoryName,
                prompt,
                paymentMethod,
                0.90,
                prompt
        );
    }
}
