package com.logistics.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TrackingUpdateRequest {

    @NotNull
    private BigDecimal latitude;

    @NotNull
    private BigDecimal longitude;

    private String statusMessage;
}

