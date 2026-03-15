package com.logistics.dto;

import com.logistics.entity.BidStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class BidResponse {

    private Long id;
    private BigDecimal amount;
    private BidStatus status;
    private Instant createdAt;
    private Long shipmentId;
    private Long carrierId;
}
