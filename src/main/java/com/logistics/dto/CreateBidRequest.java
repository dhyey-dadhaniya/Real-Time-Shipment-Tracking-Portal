package com.logistics.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateBidRequest {

    @NotNull
    private Long shipmentId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;
}
