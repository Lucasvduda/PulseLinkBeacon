package com.pulselinkproject.pulselink.controller;

import com.pulselinkproject.pulselink.dto.DeviceDTO;
import com.pulselinkproject.pulselink.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public ResponseEntity<List<DeviceDTO>> getAll() {
        return ResponseEntity.ok(deviceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeviceDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(deviceService.findById(id));
    }

    @PostMapping
    public ResponseEntity<DeviceDTO> create(@Valid @RequestBody DeviceDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deviceService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeviceDTO> update(@PathVariable Long id, @Valid @RequestBody DeviceDTO dto) {
        return ResponseEntity.ok(deviceService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        deviceService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
