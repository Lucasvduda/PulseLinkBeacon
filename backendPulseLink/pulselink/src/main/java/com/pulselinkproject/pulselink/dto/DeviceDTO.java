package com.pulselinkproject.pulselink.dto;

import com.pulselinkproject.pulselink.model.enums.DeviceStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceDTO {

    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    private DeviceStatus status;
    private Integer batteryLevel;
    private Double latitude;
    private Double longitude;
    private LocalDateTime lastSeen;
    private Boolean satelliteConnected;
    private Boolean active;
    private LocalDateTime createdAt;
}
