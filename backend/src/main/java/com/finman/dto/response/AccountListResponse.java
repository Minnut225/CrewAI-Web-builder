package com.finman.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountListResponse {
    private List<AccountResponse> accounts;
    private Long totalBalance;
    private Long netWorth;
    private Long totalAssets;
    private Long totalLiabilities;
}
