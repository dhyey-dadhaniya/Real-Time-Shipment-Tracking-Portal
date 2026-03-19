package com.logistics.controller;

import com.logistics.dto.TrackingUpdateRequest;
import com.logistics.dto.TrackingUpdateResponse;
import com.logistics.service.TrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tracking")
public class TrackingController {

    private final TrackingService trackingService;

    @PostMapping("/shipments/{shipmentId}")
    public ResponseEntity<TrackingUpdateResponse> publishTrackingUpdate(
            @PathVariable Long shipmentId,
            @Valid @RequestBody TrackingUpdateRequest request
    ) {
        return ResponseEntity.ok(trackingService.publishUpdate(shipmentId, request));
    }

    @GetMapping("/shipments/{shipmentId}/history")
    public ResponseEntity<List<TrackingUpdateResponse>> history(@PathVariable Long shipmentId) {
        return ResponseEntity.ok(trackingService.getRecentPoints(shipmentId));
    }

    @MessageMapping("/tracking/update")
    public void handleWsUpdate(@Payload TrackingUpdateRequest request) {
        // Reserved for future STOMP client → server flow.
        // HTTP endpoint above is enough for today.
    }
}

