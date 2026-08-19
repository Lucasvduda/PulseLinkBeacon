package com.pulselinkproject.pulselink.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "smoke_detected")
    @Builder.Default
    private Boolean smokeDetected = false;

    @Column(name = "impact_detected")
    @Builder.Default
    private Boolean impactDetected = false;

    @Column(name = "temperature_celsius")
    private Double temperatureCelsius;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    private Double latitude;
    private Double longitude;

    @Column(name = "satellite_connected")
    @Builder.Default
    private Boolean satelliteConnected = false;

    @Column(name = "signal_strength")
    private Integer signalStrength;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
