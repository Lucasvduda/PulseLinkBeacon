package com.pulselinkproject.pulselink.config;

import com.pulselinkproject.pulselink.model.Device;
import com.pulselinkproject.pulselink.model.User;
import com.pulselinkproject.pulselink.model.enums.DeviceStatus;
import com.pulselinkproject.pulselink.model.enums.UserRole;
import com.pulselinkproject.pulselink.repository.DeviceRepository;
import com.pulselinkproject.pulselink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(DeviceRepository deviceRepository,
                               UserRepository userRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed users
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .fullName("Administrador PulseLink")
                        .email("admin@pulselink.com")
                        .role(UserRole.ADMIN)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build());

                userRepository.save(User.builder()
                        .username("operador")
                        .password(passwordEncoder.encode("oper123"))
                        .fullName("Operador de Campo")
                        .email("operador@pulselink.com")
                        .role(UserRole.OPERATOR)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build());

                System.out.println("=== PulseLink Beacon — Usuarios criados ===");
                System.out.println("    Admin:    admin / admin123");
                System.out.println("    Operador: operador / oper123");
            }

            // Seed devices
            if (deviceRepository.count() == 0) {
                deviceRepository.save(Device.builder()
                        .name("Beacon Alpha - Serra do Mar")
                        .serialNumber("PLB-001-ALPHA")
                        .status(DeviceStatus.ONLINE)
                        .batteryLevel(87)
                        .latitude(-23.9955)
                        .longitude(-46.3051)
                        .lastSeen(LocalDateTime.now())
                        .satelliteConnected(true)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build());

                deviceRepository.save(Device.builder()
                        .name("Beacon Beta - Pantanal Norte")
                        .serialNumber("PLB-002-BETA")
                        .status(DeviceStatus.ONLINE)
                        .batteryLevel(62)
                        .latitude(-17.7250)
                        .longitude(-57.5900)
                        .lastSeen(LocalDateTime.now())
                        .satelliteConnected(true)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build());

                deviceRepository.save(Device.builder()
                        .name("Beacon Gamma - Amazônia Ocidental")
                        .serialNumber("PLB-003-GAMMA")
                        .status(DeviceStatus.OFFLINE)
                        .batteryLevel(15)
                        .latitude(-3.1190)
                        .longitude(-60.0217)
                        .lastSeen(LocalDateTime.now().minusHours(3))
                        .satelliteConnected(false)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build());

                System.out.println("=== PulseLink Beacon — Dados iniciais carregados ===");
                System.out.println("    3 dispositivos registrados.");
                System.out.println("    API disponível em: http://localhost:8080/api");
                System.out.println("    H2 Console: http://localhost:8080/h2-console");
            }
        };
    }
}
