package com.logistics.dto;

import com.logistics.entity.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateShipmentStatusRequest {

    @NotNull
    private ShipmentStatus status;
}

