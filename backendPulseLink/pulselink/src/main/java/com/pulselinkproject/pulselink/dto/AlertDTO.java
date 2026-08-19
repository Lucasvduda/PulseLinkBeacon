package com.pulselinkproject.pulselink.dto;

import com.pulselinkproject.pulselink.model.enums.AlertStatus;
import com.pulselinkproject.pulselink.model.enums.AlertType;
import com.pulselinkproject.pulselink.model.enums.RiskLevel;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDTO {

    private Long id;

    @NotNull(message = "Device ID is required")
    private Long deviceId;

    private String deviceName;

    @NotNull(message = "Alert type is required")
    private AlertType type;

    private AlertStatus status;

    @NotNull(message = "Risk level is required")
    private RiskLevel riskLevel;

    private Double latitude;
    private Double longitude;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolvedAt;
}
