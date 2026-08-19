package com.pulselinkproject.pulselink.dto;

import com.pulselinkproject.pulselink.model.enums.UserRole;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private String token;
    private String username;
    private String fullName;
    private UserRole role;
}
