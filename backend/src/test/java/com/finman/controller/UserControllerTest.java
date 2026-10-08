package com.finman.controller;

import com.finman.dto.user.*;
import com.finman.security.UserPrincipal;
import com.finman.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserControllerTest {

    private MockMvc mockMvc;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = Mockito.mock(UserService.class);
        UserController userController = new UserController(userService);
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setCustomArgumentResolvers(new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                .build();
    }

    private UsernamePasswordAuthenticationToken getAuthPrincipal() {
        UserPrincipal principal = new UserPrincipal(1L, "test@example.com", "password", "Test User", Collections.emptyList());
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    void testGetProfile() throws Exception {
        UserProfileResponse response = UserProfileResponse.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .build();

        Mockito.when(userService.getUserProfile(1L)).thenReturn(response);

        mockMvc.perform(get("/api/users/profile")
                .principal(getAuthPrincipal()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test User"));
    }

    @Test
    void testUpdateProfile() throws Exception {
        UserProfileResponse response = UserProfileResponse.builder()
                .id(1L)
                .name("Updated Name")
                .email("test@example.com")
                .build();

        Mockito.when(userService.updateProfile(eq(1L), any(UpdateProfileRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/users/profile")
                .principal(getAuthPrincipal())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Updated Name\",\"email\":\"test@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    void testGetUserSettings() throws Exception {
        UserSettingsResponse response = UserSettingsResponse.builder()
                .id(1L)
                .userId(1L)
                .currency("USD")
                .theme("LIGHT")
                .build();

        Mockito.when(userService.getUserSettings(1L)).thenReturn(response);

        mockMvc.perform(get("/api/users/settings")
                .principal(getAuthPrincipal()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currency").value("USD"));
    }

    @Test
    void testUpdateUserSettings() throws Exception {
        UserSettingsResponse response = UserSettingsResponse.builder()
                .id(1L)
                .userId(1L)
                .currency("USD")
                .theme("LIGHT")
                .build();

        Mockito.when(userService.updateUserSettings(eq(1L), any(UpdateSettingsRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/users/settings")
                .principal(getAuthPrincipal())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"currency\":\"USD\",\"theme\":\"LIGHT\",\"language\":\"vi\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currency").value("USD"));
    }

    @Test
    void testExportUserData() throws Exception {
        ExportDataResponse exportResp = ExportDataResponse.builder()
                .downloadUrl("data:application/json;base64,e30=")
                .format("json")
                .generatedAt(java.time.Instant.now().toString())
                .recordCount(0)
                .build();
        Mockito.when(userService.exportData(eq(1L), any())).thenReturn(exportResp);

        mockMvc.perform(get("/api/users/export")
                .principal(getAuthPrincipal()))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteAccount() throws Exception {
        mockMvc.perform(delete("/api/users/account")
                .principal(getAuthPrincipal())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        Mockito.verify(userService).deleteAccount(1L);
    }
}
