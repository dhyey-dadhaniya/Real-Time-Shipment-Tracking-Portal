package com.logistics.service;

import com.logistics.dto.ShipmentResponse;
import com.logistics.entity.Shipment;
import com.logistics.entity.ShipmentStatus;
import com.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Marketplace board: Carriers see only available (POSTED) shipments.
 * Shipper-specific data access is denied by security config (CARRIER role cannot call /api/shipments/**).
 */
@Service
@RequiredArgsConstructor
public class MarketplaceService {

    private final ShipmentRepository shipmentRepository;

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAvailableShipments() {
        return shipmentRepository.findAllByStatusOrderByCreatedAtDesc(ShipmentStatus.POSTED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ShipmentResponse toResponse(Shipment s) {
        return ShipmentResponse.builder()
                .id(s.getId())
                .origin(s.getOrigin())
                .destination(s.getDestination())
                .weightKg(s.getWeightKg())
                .status(s.getStatus())
                .trackingId(s.getTrackingId())
                .createdAt(s.getCreatedAt())
                .shipperId(s.getShipper().getId())
                .build();
    }
}
