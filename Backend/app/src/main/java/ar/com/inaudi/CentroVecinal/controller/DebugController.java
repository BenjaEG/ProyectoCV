package ar.com.inaudi.CentroVecinal.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/auth")
    public Object auth(Authentication authentication) {
        return authentication.getAuthorities();
    }

}
