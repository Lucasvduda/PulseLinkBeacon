package com.pulselinkproject.pulselink.repository;

import com.pulselinkproject.pulselink.model.Device;
import com.pulselinkproject.pulselink.model.enums.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    List<Device> findByActiveTrue();

    List<Device> findByStatus(DeviceStatus status);

    Optional<Device> findBySerialNumber(String serialNumber);

    boolean existsBySerialNumber(String serialNumber);
}
