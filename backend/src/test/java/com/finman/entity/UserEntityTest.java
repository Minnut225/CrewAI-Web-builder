package com.finman.entity;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;

class UserEntityTest {

    @Test
    void entityDeclaresUniqueConstraintOnEmail() {
        Table table = User.class.getAnnotation(Table.class);
        assertNotNull(table);

        UniqueConstraint uc = Arrays.stream(table.uniqueConstraints())
            .filter(c -> c.name().equals("uk_user_email"))
            .findFirst().orElseThrow(() -> new AssertionError("Unique constraint uk_user_email missing"));

        assertArrayEquals(new String[]{"email"}, uc.columnNames());
    }
}