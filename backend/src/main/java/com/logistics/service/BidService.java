package com.logistics.service;

import com.logistics.dto.BidResponse;
import com.logistics.dto.CreateBidRequest;
import com.logistics.entity.*;
import com.logistics.repository.BidRepository;
import com.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final ShipmentRepository shipmentRepository;
    private final CurrentUserService currentUserService;

    @Transactional
    public BidResponse placeBid(CreateBidRequest request) {
        User carrier = currentUserService.getCurrentUser();
        if (carrier == null) throw new IllegalStateException("Not authenticated");
        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
        if (shipment.getStatus() != ShipmentStatus.POSTED) {
            throw new IllegalArgumentException("Shipment is not open for bids");
        }
        if (bidRepository.existsByShipmentIdAndCarrierId(shipment.getId(), carrier.getId())) {
            throw new IllegalArgumentException("You have already bid on this shipment");
        }
        Bid bid = Bid.builder()
                .amount(request.getAmount())
                .shipment(shipment)
                .carrier(carrier)
                .build();
        bid = bidRepository.save(bid);
        return toResponse(bid);
    }

    @Transactional(readOnly = true)
    public List<BidResponse> findMyBids() {
        User carrier = currentUserService.getCurrentUser();
        if (carrier == null) throw new IllegalStateException("Not authenticated");
        return bidRepository.findAllByCarrierIdOrderByCreatedAtDesc(carrier.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private BidResponse toResponse(Bid b) {
        return BidResponse.builder()
                .id(b.getId())
                .amount(b.getAmount())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .shipmentId(b.getShipment().getId())
                .carrierId(b.getCarrier().getId())
                .build();
    }
}
