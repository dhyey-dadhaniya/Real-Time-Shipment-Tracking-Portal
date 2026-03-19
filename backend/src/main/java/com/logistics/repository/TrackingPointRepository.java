package com.logistics.repository;

import com.logistics.entity.TrackingPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrackingPointRepository extends JpaRepository<TrackingPoint, Long> {

    List<TrackingPoint> findTop200ByShipmentIdOrderByCreatedAtDesc(Long shipmentId);
}

