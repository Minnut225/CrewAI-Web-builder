package com.finman.service.impl;

import com.finman.dto.request.GoogleAuthRequest;
import com.finman.dto.request.LoginRequest;
import com.finman.dto.request.RegisterRequest;
import com.finman.dto.response.AuthResponse;
import com.finman.dto.response.UserResponse;
import com.finman.entity.Account;
import com.finman.entity.User;
import com.finman.entity.UserSettings;
import com.finman.exception.BadRequestException;
import com.finman.exception.DuplicateResourceException;
import com.finman.repository.AccountRepository;
import com.finman.repository.UserRepository;
import com.finman.repository.UserSettingsRepository;
import com.finman.security.JwtTokenProvider;
import com.finman.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: Email already exists: {}", request.getEmail());
            throw new DuplicateResourceException("Email đã được sử dụng (already exists) trong hệ thёng: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        // Automatically create initial default cash wallet ("Tiền mặt") with 0 balance (Zero-Float rule)
        Account initialWallet = Account.builder()
                .userId(savedUser.getId())
                .name("Tiển mặt")
                .type("CASH")
                .balance(0L)
                .currency("VND")
                .build();

        accountRepository.save(initialWallet);
        log.info("Initial default cash wallet 'Tiển mặt' created for user ID: {}", savedUser.getId());

        // Initialize default user settings (VND, Vietnamese language, notifications enabled)
        UserSettings defaultSettings = UserSettings.builder()
                .userId(savedUser.getId())
                .currency("VND")
                .theme("light")
                .language("vi")
                .notificationsEnabled(true)
                .emailNotifications(true)
                .pushNotifications(true)
                .biometricEnabled(false)
                .monthlyBudgetAlertThreshold(80)
                .build();
        userSettingsRepository.save(defaultSettings);
        log.info("Initial default user settings created for user ID: {}", savedUser.getId());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);

        UserResponse userResponse = UserResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .createdAt(savedUser.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting to login user with email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + request.getEmail()));

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .createdAt(user.getCreatedAt())
                .build();

        log.info("User logged in successfully with email: {}", request.getEmail());

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        log.info("Processing Google OAuth login for email: {}", request.getEmail());

        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email Google không được để trống");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("New Google user detected. Auto-provisioning user & default wallet for: {}", email);
            String fullName = request.getFullName() != null && !request.getFullName().isBlank()
                    ? request.getFullName()
                    : email.split("@")[0];

            User newUser = User.builder()
                    .email(email)
                    .fullName(fullName)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .build();

            User savedNewUser = userRepository.save(newUser);

            Account defaultAccount = Account.builder()
                    .userId(savedNewUser.getId())
                    .name("Tiển mặt")
                    .type("CASH")
                    .balance(0L)
                    .currency("VND")
                    .build();

            accountRepository.save(defaultAccount);

            UserSettings defaultSettings = UserSettings.builder()
                    .userId(savedNewUser.getId())
                    .currency("VND")
                    .theme("light")
                    .language("vi")
                    .notificationsEnabled(true)
                    .emailNotifications(true)
                    .pushNotifications(true)
                    .biometricEnabled(false)
                    .monthlyBudgetAlertThreshold(80)
                    .build();
            userSettingsRepository.save(defaultSettings);

            return savedNewUser;
        });


        String jwt = tokenProvider.generateTokenFromUsername(user.getEmail());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        log.info("Fetching current user profile for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));

        return UserResponse.builder()
                .id(user.getEmail() == null ? null : user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
