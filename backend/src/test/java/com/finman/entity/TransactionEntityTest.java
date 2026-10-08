package com.finman.entity;

import jakarta.persistence.Index;
import jakarta.persistence.Table;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class TransactionEntityTest {

    @Test
    void entityDeclaresAllRequiredIndexes() {
        Table table = Transaction.class.getAnnotation(Table.class);
        assertNotNull(table, "@Table annotation missing on Transaction");

        Set<String> indexNames = Arrays.stream(table.indexes())
            .map(Index::name)
            .collect(Collectors.toSet());

        // Required indexes per ARCHITECTURE_PLAN.md §3.2
        assertTrue(indexNames.contains("idx_transactions_user_date"));
        assertTrue(indexNames.contains("idx_transactions_user_account"));
        assertTrue(indexNames.contains("idx_transactions_user_category"));
        assertTrue(indexNames.contains("idx_transactions_user_type"));
        assertTrue(indexNames.contains("idx_transactions_note"));

        // Verify column lists
        Index idxUserCategory = Arrays.stream(table.indexes())
            .filter(i -> i.name().equals("idx_transactions_user_category"))
            .findFirst().orElseThrow();
        assertEquals("user_id, category_id", idxUserCategory.columnList());

        Index idxUserType = Arrays.stream(table.indexes())
            .filter(i -> i.name().equals("idx_transactions_user_type"))
            .findFirst().orElseThrow();
        assertEquals("user_id, type", idxUserType.columnList());

        Index idxNote = Arrays.stream(table.indexes())
            .filter(i -> i.name().equals("idx_transactions_note"))
            .findFirst().orElseThrow();
        assertEquals("note", idxNote.columnList());
    }
}