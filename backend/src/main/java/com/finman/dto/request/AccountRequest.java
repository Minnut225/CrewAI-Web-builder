package com.finman.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountRequest {
    @NotBlank(message = "Account name is required")
    private String name;

    @NotBlank(message = "Account type is required")
    private String type; // e.g. BANK, CASH, E_WALLET, CREDIT, INVESTMENT

    @NotNull(message = "Balance is required")
    private Long balance;

    @NotBlank(message = "Currency is required")
    private String currency; // e.g. VND, USD

    private String description;
    
    private String icon;

}
