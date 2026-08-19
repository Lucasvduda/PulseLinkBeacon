package com.pulselinkproject.pulselink.service;

import com.pulselinkproject.pulselink.dto.AlertDTO;
import com.pulselinkproject.pulselink.dto.SensorReadingDTO;
import com.pulselinkproject.pulselink.model.Device;
import com.pulselinkproject.pulselink.model.SensorReading;
import com.pulselinkproject.pulselink.model.enums.AlertType;
import com.pulselinkproject.pulselink.model.enums.RiskLevel;
import com.pulselinkproject.pulselink.repository.DeviceRepository;
import com.pulselinkproject.pulselink.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SensorService {

    private final SensorReadingRepository sensorReadingRepository;
    private final DeviceRepository deviceRepository;
    private final AlertService alertService;
    private final DeviceService deviceService;

    @Transactional
    public SensorReadingDTO processReading(SensorReadingDTO dto) {
        Device device = deviceRepository.findById(dto.getDeviceId())
                .orElseThrow(() -> new RuntimeException("Device not found: " + dto.getDeviceId()));

        SensorReading reading = SensorReading.builder()
                .device(device)
                .smokeDetected(dto.getSmokeDetected())
                .impactDetected(dto.getImpactDetected())
                .temperatureCelsius(dto.getTemperatureCelsius())
                .batteryLevel(dto.getBatteryLevel())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .satelliteConnected(dto.getSatelliteConnected())
                .signalStrength(dto.getSignalStrength())
                .timestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now())
                .build();

        sensorReadingRepository.save(reading);

        // Update device heartbeat
        deviceService.updateHeartbeat(
                device.getId(),
                dto.getLatitude(),
                dto.getLongitude(),
                dto.getBatteryLevel(),
                dto.getSatelliteConnected()
        );

        // Auto-generate alerts based on sensor data
        triggerAlertsIfNeeded(dto, device);

        return toDTO(reading);
    }

    private void triggerAlertsIfNeeded(SensorReadingDTO dto, Device device) {
        if (Boolean.TRUE.equals(dto.getSmokeDetected())) {
            createAutoAlert(device, AlertType.FIRE, RiskLevel.CRITICAL,
                    "Smoke detected — possible fire at device " + device.getName(),
                    dto.getLatitude(), dto.getLongitude());
        }
        if (Boolean.TRUE.equals(dto.getImpactDetected())) {
            createAutoAlert(device, AlertType.IMPACT, RiskLevel.HIGH,
                    "Strong impact detected at device " + device.getName(),
                    dto.getLatitude(), dto.getLongitude());
        }
        if (dto.getTemperatureCelsius() != null && dto.getTemperatureCelsius() > 60.0) {
            createAutoAlert(device, AlertType.HIGH_TEMPERATURE, RiskLevel.HIGH,
                    "Critical temperature " + dto.getTemperatureCelsius() + "°C at device " + device.getName(),
                    dto.getLatitude(), dto.getLongitude());
        }
        if (dto.getBatteryLevel() != null && dto.getBatteryLevel() <= 10) {
            createAutoAlert(device, AlertType.LOW_BATTERY, RiskLevel.MEDIUM,
                    "Battery at " + dto.getBatteryLevel() + "% — device " + device.getName(),
                    dto.getLatitude(), dto.getLongitude());
        }
    }

    private void createAutoAlert(Device device, AlertType type, RiskLevel risk,
                                 String description, Double lat, Double lon) {
        AlertDTO alertDTO = AlertDTO.builder()
                .deviceId(device.getId())
                .type(type)
                .riskLevel(risk)
                .latitude(lat)
                .longitude(lon)
                .description(description)
                .build();
        alertService.create(alertDTO);
    }

    public List<SensorReadingDTO> findByDevice(Long deviceId) {
        return sensorReadingRepository.findByDeviceIdOrderByTimestampDesc(deviceId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<SensorReadingDTO> findLatestPerDevice() {
        return sensorReadingRepository.findLatestPerDevice()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public SensorReadingDTO toDTO(SensorReading r) {
        return SensorReadingDTO.builder()
                .id(r.getId())
                .deviceId(r.getDevice().getId())
                .deviceName(r.getDevice().getName())
                .smokeDetected(r.getSmokeDetected())
                .impactDetected(r.getImpactDetected())
                .temperatureCelsius(r.getTemperatureCelsius())
                .batteryLevel(r.getBatteryLevel())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .satelliteConnected(r.getSatelliteConnected())
                .signalStrength(r.getSignalStrength())
                .timestamp(r.getTimestamp())
                .build();
    }
}
