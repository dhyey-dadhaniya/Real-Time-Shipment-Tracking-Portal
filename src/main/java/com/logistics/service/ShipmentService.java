package com.logistics.service;

import com.logistics.dto.CreateShipmentRequest;
import com.logistics.dto.ShipmentResponse;
import com.logistics.entity.Shipment;
import com.logistics.entity.User;
import com.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public ShipmentResponse create(CreateShipmentRequest request) {
        User shipper = currentUserService.getCurrentUser();
        if (shipper == null) throw new IllegalStateException("Not authenticated");
        Shipment shipment = Shipment.builder()
                .origin(request.getOrigin())
                .destination(request.getDestination())
                .weightKg(request.getWeightKg())
                .shipper(shipper)
                .build();
        shipment = shipmentRepository.save(shipment);
        return toResponse(shipment);
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> findMyShipments() {
        User shipper = currentUserService.getCurrentUser();
        if (shipper == null) throw new IllegalStateException("Not authenticated");
        return shipmentRepository.findAllByShipperIdOrderByCreatedAtDesc(shipper.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getByTrackingId(String trackingId) {
        return shipmentRepository.findByTrackingId(trackingId)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + trackingId));
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getById(Long id) {
        User shipper = currentUserService.getCurrentUser();
        if (shipper == null) throw new IllegalStateException("Not authenticated");
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + id));
        if (!shipment.getShipper().getId().equals(shipper.getId())) {
            throw new IllegalArgumentException("Access denied: not your shipment");
        }
        return toResponse(shipment);
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
