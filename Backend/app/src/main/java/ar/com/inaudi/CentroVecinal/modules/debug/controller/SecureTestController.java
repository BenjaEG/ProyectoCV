package ar.com.inaudi.CentroVecinal.modules.debug.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
public class SecureTestController {

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/me")
    public String me(@AuthenticationPrincipal Jwt jwt) {
        return jwt.getSubject();
    }
}
