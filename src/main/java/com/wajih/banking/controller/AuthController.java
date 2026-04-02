package com.wajih.banking.controller;

import com.wajih.banking.entity.User;
import com.wajih.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (userRepository.findByUsername(username).isPresent()) {
            Map<String, Object> res = new HashMap<>();
            res.put("success", false);
            res.put("message", "Username already exists");
            return ResponseEntity.ok(res);
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setBalance(0.0);
        userRepository.save(user);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        Map<String, Object> res = new HashMap<>();
        boolean valid = userRepository.findByUsername(username)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()))
                .isPresent();

        if (valid) {
            res.put("success", true);
        } else {
            res.put("success", false);
            res.put("message", "Invalid credentials");
        }
        return ResponseEntity.ok(res);
    }
}
