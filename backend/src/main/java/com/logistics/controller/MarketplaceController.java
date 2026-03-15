package com.logistics.controller;

import com.logistics.dto.ShipmentResponse;
import com.logistics.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Carrier-only: browse available shipments (load board) to bid on.
 */
@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping("/shipments")
    public ResponseEntity<List<ShipmentResponse>> availableShipments() {
        return ResponseEntity.ok(marketplaceService.getAvailableShipments());
    }
}
