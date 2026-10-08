package com.finman.dto.response;

import com.finman.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private Long userId;
    private String name;
    private String type;
    private Long balance;
    private String currency;
    private String description;
    private String icon;
    private String color;
    private Boolean isArchived;
    private Instant createdAt;
    private Instant updatedAt;

    public static AccountResponse fromEntity(Account account) {
        if (account == null) return null;
        return AccountResponse.builder()
                .id(account.getId())
                .userId(account.getUserId())
                .name(account.getName())
                .type(account.getType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .isArchived(account.getIsArchived())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
