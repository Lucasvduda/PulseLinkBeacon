package com.pulselinkproject.pulselink.service;

import com.pulselinkproject.pulselink.dto.AlertDTO;
import com.pulselinkproject.pulselink.model.Alert;
import com.pulselinkproject.pulselink.model.Device;
import com.pulselinkproject.pulselink.model.enums.AlertStatus;
import com.pulselinkproject.pulselink.model.enums.DeviceStatus;
import com.pulselinkproject.pulselink.repository.AlertRepository;
import com.pulselinkproject.pulselink.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final DeviceRepository deviceRepository;

    public List<AlertDTO> findAll() {
        return alertRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<AlertDTO> findActive() {
        return alertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.ACTIVE)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<AlertDTO> findByDevice(Long deviceId) {
        return alertRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public AlertDTO findById(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + id));
        return toDTO(alert);
    }

    @Transactional
    public AlertDTO create(AlertDTO dto) {
        Device device = deviceRepository.findById(dto.getDeviceId())
                .orElseThrow(() -> new RuntimeException("Device not found: " + dto.getDeviceId()));

        Alert alert = Alert.builder()
                .device(device)
                .type(dto.getType())
                .status(AlertStatus.ACTIVE)
                .riskLevel(dto.getRiskLevel())
                .latitude(dto.getLatitude() != null ? dto.getLatitude() : device.getLatitude())
                .longitude(dto.getLongitude() != null ? dto.getLongitude() : device.getLongitude())
                .description(dto.getDescription())
                .createdAt(LocalDateTime.now())
                .build();

        device.setStatus(DeviceStatus.EMERGENCY);
        deviceRepository.save(device);

        return toDTO(alertRepository.save(alert));
    }

    @Transactional
    public AlertDTO acknowledge(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + id));
        alert.setStatus(AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedAt(LocalDateTime.now());
        return toDTO(alertRepository.save(alert));
    }

    @Transactional
    public AlertDTO resolve(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + id));
        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());

        // Check if device has other active alerts, if not restore to ONLINE
        long remaining = alertRepository.countByStatus(AlertStatus.ACTIVE);
        if (remaining <= 1) {
            alert.getDevice().setStatus(DeviceStatus.ONLINE);
            deviceRepository.save(alert.getDevice());
        }
        return toDTO(alertRepository.save(alert));
    }

    public long countActive() {
        return alertRepository.countByStatus(AlertStatus.ACTIVE);
    }

    public AlertDTO toDTO(Alert alert) {
        return AlertDTO.builder()
                .id(alert.getId())
                .deviceId(alert.getDevice().getId())
                .deviceName(alert.getDevice().getName())
                .type(alert.getType())
                .status(alert.getStatus())
                .riskLevel(alert.getRiskLevel())
                .latitude(alert.getLatitude())
                .longitude(alert.getLongitude())
                .description(alert.getDescription())
                .createdAt(alert.getCreatedAt())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .resolvedAt(alert.getResolvedAt())
                .build();
    }
}
