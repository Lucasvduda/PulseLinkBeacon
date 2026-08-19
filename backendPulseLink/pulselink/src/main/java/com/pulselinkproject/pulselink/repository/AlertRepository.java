package com.pulselinkproject.pulselink.repository;

import com.pulselinkproject.pulselink.model.Alert;
import com.pulselinkproject.pulselink.model.enums.AlertStatus;
import com.pulselinkproject.pulselink.model.enums.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByStatusOrderByCreatedAtDesc(AlertStatus status);

    List<Alert> findByDeviceIdOrderByCreatedAtDesc(Long deviceId);

    List<Alert> findByDeviceIdAndStatus(Long deviceId, AlertStatus status);

    List<Alert> findAllByOrderByCreatedAtDesc();

    long countByStatus(AlertStatus status);

    List<Alert> findByTypeAndStatus(AlertType type, AlertStatus status);
}
