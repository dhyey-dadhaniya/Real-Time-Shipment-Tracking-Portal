package com.logistics.repository;

import com.logistics.entity.Bid;
import com.logistics.entity.BidStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findAllByShipmentIdOrderByAmountAsc(Long shipmentId);

    List<Bid> findAllByCarrierIdOrderByCreatedAtDesc(Long carrierId);

    Optional<Bid> findByShipmentIdAndStatus(Long shipmentId, BidStatus status);

    boolean existsByShipmentIdAndCarrierId(Long shipmentId, Long carrierId);
}
