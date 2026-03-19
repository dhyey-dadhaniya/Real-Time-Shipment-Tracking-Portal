package com.logistics.dto;

import com.logistics.entity.ShipmentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class ShipmentResponse {

    private Long id;
    private String origin;
    private String destination;
    private BigDecimal weightKg;
    private ShipmentStatus status;
    private String trackingId;
    private Instant createdAt;
    private Long shipperId;
    private Long awardedCarrierId;
}
