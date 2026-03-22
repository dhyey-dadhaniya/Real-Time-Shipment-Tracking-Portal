package com.logistics.service;

import com.logistics.dto.TrackingUpdateResponse;
import com.logistics.entity.Shipment;
import com.logistics.entity.ShipmentStatus;
import com.logistics.entity.TrackingPoint;
import com.logistics.entity.User;
import com.logistics.repository.ShipmentRepository;
import com.logistics.repository.TrackingPointRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrackingServicePublicHistoryTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private TrackingPointRepository trackingPointRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private TrackingService trackingService;

    @Test
    void getPublicHistoryByTrackingId_mapsPoints() {
        User shipper = User.builder().id(1L).email("s@x.com").name("S").password("p").role(com.logistics.entity.UserRole.SHIPPER).build();
        Shipment shipment = Shipment.builder()
                .id(10L)
                .origin("A")
                .destination("B")
                .weightKg(BigDecimal.ONE)
                .status(ShipmentStatus.IN_TRANSIT)
                .trackingId("TRK-1")
                .shipper(shipper)
                .createdAt(Instant.now())
                .build();

        TrackingPoint p = TrackingPoint.builder()
                .id(1L)
                .shipment(shipment)
                .latitude(new BigDecimal("12.34"))
                .longitude(new BigDecimal("56.78"))
                .statusMessage("ok")
                .createdAt(Instant.parse("2024-01-01T00:00:00Z"))
                .build();

        when(shipmentRepository.findByTrackingId("TRK-1")).thenReturn(Optional.of(shipment));
        when(trackingPointRepository.findTop200ByShipmentIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(p));

        List<TrackingUpdateResponse> out = trackingService.getPublicHistoryByTrackingId("TRK-1");

        assertThat(out).hasSize(1);
        assertThat(out.get(0).getTrackingId()).isEqualTo("TRK-1");
        assertThat(out.get(0).getLatitude()).isEqualTo(new BigDecimal("12.34"));
        assertThat(out.get(0).getLongitude()).isEqualTo(new BigDecimal("56.78"));
    }

    @Test
    void getPublicHistoryByTrackingId_unknownId_throws() {
        when(shipmentRepository.findByTrackingId("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> trackingService.getPublicHistoryByTrackingId("missing"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Shipment not found");
    }
}
