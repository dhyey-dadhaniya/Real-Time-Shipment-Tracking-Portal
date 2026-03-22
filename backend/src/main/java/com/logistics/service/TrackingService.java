package com.logistics.service;

import com.logistics.dto.TrackingUpdateRequest;
import com.logistics.dto.TrackingUpdateResponse;
import com.logistics.entity.Shipment;
import com.logistics.entity.TrackingPoint;
import com.logistics.entity.User;
import com.logistics.entity.UserRole;
import com.logistics.repository.ShipmentRepository;
import com.logistics.repository.TrackingPointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final ShipmentRepository shipmentRepository;
    private final TrackingPointRepository trackingPointRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CurrentUserService currentUserService;

    @Transactional
    public TrackingUpdateResponse publishUpdate(Long shipmentId, TrackingUpdateRequest request) {
        User carrier = currentUserService.getCurrentUser();
        if (carrier == null) throw new IllegalStateException("Not authenticated");
        if (carrier.getRole() != UserRole.CARRIER) {
            throw new IllegalArgumentException("Access denied: carrier only");
        }

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + shipmentId));
        if (shipment.getAwardedCarrier() == null || !shipment.getAwardedCarrier().getId().equals(carrier.getId())) {
            throw new IllegalArgumentException("Access denied: not your assigned shipment");
        }

        TrackingPoint point = TrackingPoint.builder()
                .shipment(shipment)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .statusMessage(request.getStatusMessage())
                .build();
        trackingPointRepository.save(point);

        TrackingUpdateResponse response = TrackingUpdateResponse.builder()
                .shipmentId(shipment.getId())
                .trackingId(shipment.getTrackingId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .statusMessage(request.getStatusMessage())
                .shipmentStatus(shipment.getStatus())
                .updatedAt(Instant.now())
                .build();

        messagingTemplate.convertAndSend("/topic/shipments/" + shipment.getId(), response);
        return response;
    }

    @Transactional(readOnly = true)
    public List<TrackingUpdateResponse> getRecentPoints(Long shipmentId) {
        User user = currentUserService.getCurrentUser();
        if (user == null) throw new IllegalStateException("Not authenticated");

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + shipmentId));

        boolean canAccess =
                (user.getRole() == UserRole.SHIPPER && shipment.getShipper().getId().equals(user.getId())) ||
                (user.getRole() == UserRole.CARRIER && shipment.getAwardedCarrier() != null && shipment.getAwardedCarrier().getId().equals(user.getId()));

        if (!canAccess) {
            throw new IllegalArgumentException("Access denied");
        }

        return trackingPointRepository.findTop200ByShipmentIdOrderByCreatedAtDesc(shipmentId)
                .stream()
                .map(p -> TrackingUpdateResponse.builder()
                        .shipmentId(shipment.getId())
                        .trackingId(shipment.getTrackingId())
                        .latitude(p.getLatitude())
                        .longitude(p.getLongitude())
                        .statusMessage(p.getStatusMessage())
                        .shipmentStatus(shipment.getStatus())
                        .updatedAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Public tracking page: history by customer-facing tracking ID (no authentication).
     */
    @Transactional(readOnly = true)
    public List<TrackingUpdateResponse> getPublicHistoryByTrackingId(String trackingId) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + trackingId));
        return trackingPointRepository.findTop200ByShipmentIdOrderByCreatedAtDesc(shipment.getId())
                .stream()
                .map(p -> TrackingUpdateResponse.builder()
                        .shipmentId(shipment.getId())
                        .trackingId(shipment.getTrackingId())
                        .latitude(p.getLatitude())
                        .longitude(p.getLongitude())
                        .statusMessage(p.getStatusMessage())
                        .shipmentStatus(shipment.getStatus())
                        .updatedAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}

