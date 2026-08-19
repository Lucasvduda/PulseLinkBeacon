package com.pulselinkproject.pulselink.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorReadingDTO {

    private Long id;

    @NotNull(message = "Device ID is required")
    private Long deviceId;

    private String deviceName;

    @Builder.Default
    private Boolean smokeDetected = false;

    @Builder.Default
    private Boolean impactDetected = false;

    private Double temperatureCelsius;
    private Integer batteryLevel;
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Boolean satelliteConnected = false;

    private Integer signalStrength;
    private LocalDateTime timestamp;
}
