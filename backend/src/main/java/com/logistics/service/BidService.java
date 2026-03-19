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

    @Transactional(readOnly = true)
    public List<BidResponse> findBidsForShipmentAsShipper(Long shipmentId) {
        User shipper = currentUserService.getCurrentUser();
        if (shipper == null) throw new IllegalStateException("Not authenticated");
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
        if (!shipment.getShipper().getId().equals(shipper.getId())) {
            throw new IllegalArgumentException("Access denied: not your shipment");
        }
        return bidRepository.findAllByShipmentIdOrderByAmountAsc(shipmentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BidResponse acceptBidAsShipper(Long bidId) {
        User shipper = currentUserService.getCurrentUser();
        if (shipper == null) throw new IllegalStateException("Not authenticated");

        Bid chosenBid = bidRepository.findById(bidId)
                .orElseThrow(() -> new IllegalArgumentException("Bid not found"));

        Shipment shipment = chosenBid.getShipment();
        if (!shipment.getShipper().getId().equals(shipper.getId())) {
            throw new IllegalArgumentException("Access denied: not your shipment");
        }
        if (shipment.getStatus() != ShipmentStatus.POSTED) {
            throw new IllegalArgumentException("Shipment is not open for accepting bids");
        }

        List<Bid> bidsForShipment = bidRepository.findAllByShipmentIdOrderByAmountAsc(shipment.getId());
        for (Bid bid : bidsForShipment) {
            if (bid.getId().equals(chosenBid.getId())) {
                bid.setStatus(BidStatus.ACCEPTED);
            } else {
                bid.setStatus(BidStatus.REJECTED);
            }
        }

        shipment.setAwardedCarrier(chosenBid.getCarrier());
        shipment.setStatus(ShipmentStatus.AWAITING_PICKUP);
        bidRepository.saveAll(bidsForShipment);
        shipmentRepository.save(shipment);

        return toResponse(chosenBid);
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
