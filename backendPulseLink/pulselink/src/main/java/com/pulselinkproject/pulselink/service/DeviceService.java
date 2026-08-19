package com.pulselinkproject.pulselink.service;

import com.pulselinkproject.pulselink.dto.DeviceDTO;
import com.pulselinkproject.pulselink.model.Device;
import com.pulselinkproject.pulselink.model.enums.DeviceStatus;
import com.pulselinkproject.pulselink.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public List<DeviceDTO> findAll() {
        return deviceRepository.findByActiveTrue()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public DeviceDTO findById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found: " + id));
        return toDTO(device);
    }

    @Transactional
    public DeviceDTO create(DeviceDTO dto) {
        if (deviceRepository.existsBySerialNumber(dto.getSerialNumber())) {
            throw new RuntimeException("Serial number already registered: " + dto.getSerialNumber());
        }
        Device device = Device.builder()
                .name(dto.getName())
                .serialNumber(dto.getSerialNumber())
                .status(DeviceStatus.OFFLINE)
                .batteryLevel(100)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .satelliteConnected(false)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        return toDTO(deviceRepository.save(device));
    }

    @Transactional
    public DeviceDTO update(Long id, DeviceDTO dto) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found: " + id));
        device.setName(dto.getName());
        if (dto.getLatitude() != null) device.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) device.setLongitude(dto.getLongitude());
        if (dto.getStatus() != null) device.setStatus(dto.getStatus());
        return toDTO(deviceRepository.save(device));
    }

    @Transactional
    public void deactivate(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found: " + id));
        device.setActive(false);
        device.setStatus(DeviceStatus.OFFLINE);
        deviceRepository.save(device);
    }

    @Transactional
    public void updateHeartbeat(Long id, Double lat, Double lon, Integer battery, Boolean satellite) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found: " + id));
        device.setLastSeen(LocalDateTime.now());
        if (lat != null) device.setLatitude(lat);
        if (lon != null) device.setLongitude(lon);
        if (battery != null) {
            device.setBatteryLevel(battery);
            if (battery <= 10) device.setStatus(DeviceStatus.LOW_BATTERY);
            else if (device.getStatus() == DeviceStatus.LOW_BATTERY) device.setStatus(DeviceStatus.ONLINE);
        }
        if (satellite != null) device.setSatelliteConnected(satellite);
        if (device.getStatus() == DeviceStatus.OFFLINE) device.setStatus(DeviceStatus.ONLINE);
        deviceRepository.save(device);
    }

    public DeviceDTO toDTO(Device device) {
        return DeviceDTO.builder()
                .id(device.getId())
                .name(device.getName())
                .serialNumber(device.getSerialNumber())
                .status(device.getStatus())
                .batteryLevel(device.getBatteryLevel())
                .latitude(device.getLatitude())
                .longitude(device.getLongitude())
                .lastSeen(device.getLastSeen())
                .satelliteConnected(device.getSatelliteConnected())
                .active(device.getActive())
                .createdAt(device.getCreatedAt())
                .build();
    }
}
