package com.logistics.controller;

import com.logistics.dto.CreateShipmentRequest;
import com.logistics.dto.ShipmentResponse;
import com.logistics.dto.TrackingUpdateResponse;
import com.logistics.service.ShipmentService;
import com.logistics.service.TrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Shipper-only: create and list own shipments.
 * Public: track by tracking ID (for end-customer).
 */
@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final TrackingService trackingService;

    @PostMapping
    public ResponseEntity<ShipmentResponse> create(@Valid @RequestBody CreateShipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shipmentService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> myShipments() {
        return ResponseEntity.ok(shipmentService.findMyShipments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(shipmentService.getById(id));
    }

    @GetMapping("/track/{trackingId}")
    public ResponseEntity<ShipmentResponse> track(@PathVariable String trackingId) {
        return ResponseEntity.ok(shipmentService.getByTrackingId(trackingId));
    }

    @GetMapping("/track/{trackingId}/history")
    public ResponseEntity<List<TrackingUpdateResponse>> publicTrackingHistory(@PathVariable String trackingId) {
        return ResponseEntity.ok(trackingService.getPublicHistoryByTrackingId(trackingId));
    }
}
