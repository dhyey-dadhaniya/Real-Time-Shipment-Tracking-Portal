package com.logistics.entity;

/**
 * Lifecycle states for a shipment (e.g. AWAITING_PICKUP after bid is accepted).
 */
public enum ShipmentStatus {
    POSTED,           // Load posted by shipper, open for bids
    AWAITING_PICKUP,  // Bid accepted, locked to carrier
    IN_TRANSIT,
    DELIVERED
}
