package com.logistics;

import com.logistics.entity.Shipment;
import com.logistics.entity.ShipmentStatus;
import com.logistics.entity.TrackingPoint;
import com.logistics.entity.User;
import com.logistics.entity.UserRole;
import com.logistics.repository.ShipmentRepository;
import com.logistics.repository.TrackingPointRepository;
import com.logistics.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PublicTrackApiIntegrationTest {

    private static final String TRACKING_ID = "TRK-INTEGRATION-TEST";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private TrackingPointRepository trackingPointRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void seedShipment() {
        User shipper = User.builder()
                .name("Test Shipper")
                .email("shipper-test-" + System.nanoTime() + "@example.com")
                .password(passwordEncoder.encode("secret"))
                .role(UserRole.SHIPPER)
                .build();
        shipper = userRepository.save(shipper);

        Shipment shipment = Shipment.builder()
                .origin("Mumbai")
                .destination("Pune")
                .weightKg(new BigDecimal("100.00"))
                .status(ShipmentStatus.IN_TRANSIT)
                .trackingId(TRACKING_ID)
                .shipper(shipper)
                .build();
        shipment = shipmentRepository.save(shipment);

        TrackingPoint point = TrackingPoint.builder()
                .shipment(shipment)
                .latitude(new BigDecimal("19.0760"))
                .longitude(new BigDecimal("72.8777"))
                .statusMessage("En route")
                .build();
        trackingPointRepository.save(point);
    }

    @Test
    void getShipmentByTrackingId_withoutAuth_returns200() throws Exception {
        mockMvc.perform(get("/api/shipments/track/" + TRACKING_ID).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trackingId", is(TRACKING_ID)))
                .andExpect(jsonPath("$.origin", is("Mumbai")))
                .andExpect(jsonPath("$.destination", is("Pune")));
    }

    @Test
    void getHistoryByTrackingId_withoutAuth_returnsPoints() throws Exception {
        mockMvc.perform(get("/api/shipments/track/" + TRACKING_ID + "/history").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].trackingId", is(TRACKING_ID)))
                .andExpect(jsonPath("$[0].latitude").exists())
                .andExpect(jsonPath("$[0].longitude").exists());
    }

    @Test
    void getHistory_unknownTrackingId_returns400() throws Exception {
        mockMvc.perform(get("/api/shipments/track/UNKNOWN-ID/history").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").exists());
    }
}
