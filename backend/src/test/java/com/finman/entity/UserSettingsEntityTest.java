package com.finman.entity;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

class UserSettingsEntityTest {

    @Test
    void entityDeclaresCorrectTableAndUniqueConstraintOnUserId() {
        Table table = UserSettings.class.getAnnotation(Table.class);
        assertNotNull(table);
        assertEquals("user_settings", table.name());

        UniqueConstraint uc = Arrays.stream(table.uniqueConstraints())
                .filter(c -> c.name().equals("uk_user_settings_user_id"))
                .findFirst().orElseThrow(() -> new AssertionError("Unique constraint uk_user_settings_user_id missing"));

        assertArrayEquals(new String[]{"user_id"}, uc.columnNames());
    }

    @Test
    void entityDefaultValuesConformToFinManStandards() {
        UserSettings settings = new UserSettings();
        assertEquals("VND", settings.getCurrency());
        assertEquals("light", settings.getTheme());
        assertEquals("vi", settings.getLanguage());
        assertTrue(settings.getNotificationsEnabled());
        assertTrue(settings.getEmailNotifications());
        assertTrue(settings.getPushNotifications());
        assertFalse(settings.getBiometricEnabled());
        assertEquals(80, settings.getMonthlyBudgetAlertThreshold());
    }
}
