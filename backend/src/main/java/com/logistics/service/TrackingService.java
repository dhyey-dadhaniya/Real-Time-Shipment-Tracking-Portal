package com.logistics.service;

import com.logistics.dto.TrackingUpdateRequest;
import com.logistics.dto.TrackingUpdateResponse;
import com.logistics.entity.Shipment;
import com.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final ShipmentRepository shipmentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public TrackingUpdateResponse publishUpdate(Long shipmentId, TrackingUpdateRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + shipmentId));

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
}

