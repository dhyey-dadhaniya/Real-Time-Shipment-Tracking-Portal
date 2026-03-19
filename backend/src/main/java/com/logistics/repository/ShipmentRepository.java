package com.logistics.repository;

import com.logistics.entity.Shipment;
import com.logistics.entity.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingId(String trackingId);

    List<Shipment> findAllByShipperIdOrderByCreatedAtDesc(Long shipperId);

    List<Shipment> findAllByStatusOrderByCreatedAtDesc(ShipmentStatus status);

    List<Shipment> findAllByAwardedCarrierIdOrderByCreatedAtDesc(Long awardedCarrierId);
}
