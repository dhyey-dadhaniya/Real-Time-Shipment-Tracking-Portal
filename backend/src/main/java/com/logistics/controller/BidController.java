package com.logistics.controller;

import com.logistics.dto.BidResponse;
import com.logistics.dto.CreateBidRequest;
import com.logistics.service.BidService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Carrier-only: place bid and list own bids.
 */
@RestController
@RequestMapping("/api/bids")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @PostMapping
    public ResponseEntity<BidResponse> placeBid(@Valid @RequestBody CreateBidRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bidService.placeBid(request));
    }

    @GetMapping
    public ResponseEntity<List<BidResponse>> myBids() {
        return ResponseEntity.ok(bidService.findMyBids());
    }
}
