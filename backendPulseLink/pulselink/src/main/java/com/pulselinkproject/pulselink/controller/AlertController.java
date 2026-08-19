package com.pulselinkproject.pulselink.controller;

import com.pulselinkproject.pulselink.dto.AlertDTO;
import com.pulselinkproject.pulselink.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<AlertDTO>> getAll(
            @RequestParam(required = false) String status) {
        if ("active".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(alertService.findActive());
        }
        return ResponseEntity.ok(alertService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.findById(id));
    }

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<AlertDTO>> getByDevice(@PathVariable Long deviceId) {
        return ResponseEntity.ok(alertService.findByDevice(deviceId));
    }

    @PostMapping
    public ResponseEntity<AlertDTO> create(@Valid @RequestBody AlertDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.create(dto));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<AlertDTO> acknowledge(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.acknowledge(id));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<AlertDTO> resolve(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.resolve(id));
    }

    @GetMapping("/count/active")
    public ResponseEntity<Map<String, Long>> countActive() {
        return ResponseEntity.ok(Map.of("activeAlerts", alertService.countActive()));
    }
}
