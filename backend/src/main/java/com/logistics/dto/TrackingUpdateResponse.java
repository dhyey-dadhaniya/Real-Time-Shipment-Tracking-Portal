package com.logistics.dto;

import com.logistics.entity.ShipmentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class TrackingUpdateResponse {

    private Long shipmentId;
    private String trackingId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String statusMessage;
    private ShipmentStatus shipmentStatus;
    private Instant updatedAt;
}

