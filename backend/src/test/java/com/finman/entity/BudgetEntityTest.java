package com.finman.entity;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;

class BudgetEntityTest {

    @Test
    void entityDeclaresUniqueConstraintOnUserCategoryMonth() {
        Table table = Budget.class.getAnnotation(Table.class);
        assertNotNull(table);

        UniqueConstraint uc = Arrays.stream(table.uniqueConstraints())
            .filter(c -> c.name().equals("uk_budget_user_category_month"))
            .findFirst().orElseThrow(() -> new AssertionError("Unique constraint uk_budget_user_category_month missing"));

        assertArrayEquals(new String[]{"user_id", "category_id", "month"}, uc.columnNames());
    }

    @Test
    void entityDeclaresIndexOnUserMonth() {
        Table table = Budget.class.getAnnotation(Table.class);
        boolean hasIndex = Arrays.stream(table.indexes())
            .anyMatch(i -> i.name().equals("idx_budgets_user_month")
                && i.columnList().equals("user_id, month"));
        assertTrue(hasIndex, "Index idx_budgets_user_month missing or incorrect columnList");
    }
}