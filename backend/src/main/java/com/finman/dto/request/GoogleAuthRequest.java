package com.finman.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    @NotBlank(message = "Google ID Token hoặc Auth Code không được để trống")
    private String idToken; // Google JWT ID token received from frontend Google Sign-In SDK
    
    // Optional fields if passing raw profile from Google Identity Services popup
    private String email;
    private String fullName;
    private String avatarUrl;
}
