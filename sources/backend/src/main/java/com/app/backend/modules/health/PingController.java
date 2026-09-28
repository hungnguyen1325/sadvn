package com.app.backend.modules.health;

import com.app.backend.core.response.SuccessResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PingController {
    @PostMapping("/v1/ping")
    public SuccessResponse<Void> ping() {
        return SuccessResponse.success("pong");
    }
}
