package com.auth.backend.dto;

import com.auth.backend.enums.AccountTier;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SelectTierRequest {

    @NotNull(message = "Account tier cannot be null")
    private AccountTier tier; // Will be "FREE" or "PRO"
}