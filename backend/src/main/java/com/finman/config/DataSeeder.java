package com.finman.config;

import com.finman.entity.Category;
import com.finman.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    private static final Map<String, String> ICON_MIGRATION_MAP = Map.of(
            "utensils", "restaurant",
            "film", "movie",
            "car", "directions_car",
            "file-invoice-dollar", "receipt_long",
            "shopping-bag", "shopping_bag",
            "heartbeat", "medical_services",
            "ellipsis-h", "more_horiz",
            "wallet", "payments",
            "gift", "card_giftcard",
            "chart-line", "trending_up"
    );

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and seeding default categories...");

        List<Category> existingDefaults = categoryRepository.findByUserIdIsNull();
        if (!existingDefaults.isEmpty()) {
            boolean needsUpdate = false;
            for (Category cat : existingDefaults) {
                if (cat.getIcon() != null && ICON_MIGRATION_MAP.containsKey(cat.getIcon())) {
                    String newIcon = ICON_MIGRATION_MAP.get(cat.getIcon());
                    log.info("Migrating default category '{}' icon from '{}' to Material Symbol '{}'",
                            cat.getName(), cat.getIcon(), newIcon);
                    cat.setIcon(newIcon);
                    needsUpdate = true;
                }
            }
            if (needsUpdate) {
                categoryRepository.saveAll(existingDefaults);
                log.info("Successfully updated default category icons to standard Material Symbols.");
            } else {
                log.info("Default categories already up-to-date (count: {}).", existingDefaults.size());
            }
            return;
        }

        List<Category> defaultCategories = List.of(
            // Expense categories (Ăn uống, Giải trí, Giao thông, Hóa đơn, Mua sắm, Sức khỏe, Khác)
            createDefaultCategory("Ăn uống", "EXPENSE", "restaurant", "#FF5733"),
            createDefaultCategory("Giải trí", "EXPENSE", "movie", "#3357FF"),
            createDefaultCategory("Giao thông", "EXPENSE", "directions_car", "#33FF57"),
            createDefaultCategory("Hóa đơn & Tiện ích", "EXPENSE", "receipt_long", "#F3FF33"),
            createDefaultCategory("Mua sắm", "EXPENSE", "shopping_bag", "#FF33F3"),
            createDefaultCategory("Sức khỏe", "EXPENSE", "medical_services", "#33FFF0"),
            createDefaultCategory("Khác (Chi)", "EXPENSE", "more_horiz", "#999999"),

            // Income categories (Lương, Thưởng, Đầu tư, Khác)
            createDefaultCategory("Lương", "INCOME", "payments", "#28A745"),
            createDefaultCategory("Thưởng", "INCOME", "card_giftcard", "#17A2B8"),
            createDefaultCategory("Đầu tư", "INCOME", "trending_up", "#FFC107"),
            createDefaultCategory("Khác (Thu)", "INCOME", "more_horiz", "#6C757D")
        );

        categoryRepository.saveAll(defaultCategories);
        log.info("Successfully seeded {} default categories with standard Material Symbols.", defaultCategories.size());
    }

    private Category createDefaultCategory(String name, String type, String icon, String color) {
        Category category = new Category();
        category.setName(name);
        category.setType(type);
        category.setIcon(icon);
        return category;
    }
}
