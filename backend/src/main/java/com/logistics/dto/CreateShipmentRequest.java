package com.logistics.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateShipmentRequest {

    @NotBlank
    private String origin;

    @NotBlank
    private String destination;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal weightKg;
}
