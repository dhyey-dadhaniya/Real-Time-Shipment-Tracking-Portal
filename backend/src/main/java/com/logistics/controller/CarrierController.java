package com.logistics.controller;

import com.logistics.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import com.logistics.dto.ShipmentResponse;

@RestController
@RequestMapping("/api/carrier")
@RequiredArgsConstructor
public class CarrierController {

    private final ShipmentService shipmentService;

    @GetMapping("/shipments")
    public ResponseEntity<List<ShipmentResponse>> myAssignedShipments() {
        return ResponseEntity.ok(shipmentService.findAssignedShipmentsForCurrentCarrier());
    }
}

