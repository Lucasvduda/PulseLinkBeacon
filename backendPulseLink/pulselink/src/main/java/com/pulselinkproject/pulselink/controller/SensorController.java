package com.pulselinkproject.pulselink.controller;

import com.pulselinkproject.pulselink.dto.SensorReadingDTO;
import com.pulselinkproject.pulselink.service.SensorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensors")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;

    /**
     * Receives a sensor reading from an IoT device (or simulator).
     * Automatically evaluates conditions and generates alerts if needed.
     */
    @PostMapping("/readings")
    public ResponseEntity<SensorReadingDTO> receiveReading(@Valid @RequestBody SensorReadingDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sensorService.processReading(dto));
    }

    @GetMapping("/readings")
    public ResponseEntity<List<SensorReadingDTO>> getByDevice(
            @RequestParam(required = false) Long deviceId) {
        if (deviceId != null) {
            return ResponseEntity.ok(sensorService.findByDevice(deviceId));
        }
        return ResponseEntity.ok(sensorService.findLatestPerDevice());
    }

    @GetMapping("/readings/latest")
    public ResponseEntity<List<SensorReadingDTO>> getLatestPerDevice() {
        return ResponseEntity.ok(sensorService.findLatestPerDevice());
    }
}
