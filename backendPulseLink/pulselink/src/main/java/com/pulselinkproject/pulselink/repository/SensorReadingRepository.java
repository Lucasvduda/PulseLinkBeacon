package com.pulselinkproject.pulselink.repository;

import com.pulselinkproject.pulselink.model.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    List<SensorReading> findByDeviceIdOrderByTimestampDesc(Long deviceId);

    List<SensorReading> findByTimestampAfterOrderByTimestampDesc(LocalDateTime since);

    @Query("SELECT s FROM SensorReading s WHERE s.timestamp = " +
           "(SELECT MAX(s2.timestamp) FROM SensorReading s2 WHERE s2.device.id = s.device.id)")
    List<SensorReading> findLatestPerDevice();

    Optional<SensorReading> findFirstByDeviceIdOrderByTimestampDesc(Long deviceId);
}
