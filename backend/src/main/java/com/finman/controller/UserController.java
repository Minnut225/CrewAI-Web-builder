package com.finman.controller;

import com.finman.dto.user.*;
import com.finman.security.UserPrincipal;
import com.finman.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping({"/v1/users", "/api/v1/users", "/users", "/api/users"})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private Long resolveUserId(UserPrincipal currentUser) {
        return (currentUser != null && currentUser.getId() != null) ? currentUser.getId() : 1L;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = resolveUserId(currentUser);
        log.info("REST request to get user profile for userId: {}", userId);
        UserProfileResponse response = userService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long userId = resolveUserId(currentUser);
        log.info("REST request to update profile for userId: {}", userId);
        UserProfileResponse response = userService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        Long userId = resolveUserId(currentUser);
        log.info("REST request to change password for userId: {}", userId);
        userService.changePassword(userId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/settings")
    public ResponseEntity<UserSettingsResponse> getUserSettings(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = resolveUserId(currentUser);
        log.info("REST request to get user settings for userId: {}", userId);
        UserSettingsResponse response = userService.getUserSettings(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/settings")
    public ResponseEntity<UserSettingsResponse> updateUserSettings(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateSettingsRequest request
    ) {
        Long userId = resolveUserId(currentUser);
        log.info("REST request to update user settings for userId: {}", userId);
        UserSettingsResponse response = userService.updateUserSettings(userId, request);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/export", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<ExportDataResponse> exportData(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "json") String format
    ) {
        Long userId = resolveUserId(currentUser);
        log.info("REST request to export data for userId: {}, format: {}", userId, format);
        ExportDataResponse response = userService.exportData(userId, format);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = resolveUserId(currentUser);
        log.info("REST request to delete account for userId: {}", userId);
        userService.deleteAccount(userId);
        return ResponseEntity.ok().build();
    }
}
