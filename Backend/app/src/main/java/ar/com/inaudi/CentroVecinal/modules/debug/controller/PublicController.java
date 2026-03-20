package ar.com.inaudi.CentroVecinal.modules.debug.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicController {

    @GetMapping("/api/public/ping")
    public String ping() {
        return "ok";
    }
}