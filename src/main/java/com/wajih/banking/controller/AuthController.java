package com.wajih.banking.controller;

import com.wajih.banking.dto.AuthResponse;
import com.wajih.banking.dto.LoginRequest;
import com.wajih.banking.dto.RegisterRequest;
import com.wajih.banking.dto.UserResponse;
import com.wajih.banking.entity.User;
import com.wajih.banking.repository.UserRepository;
import com.wajih.banking.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        String username = request.getUsername().trim();
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setBalance(0.0);
        userRepository.save(user);

        String token = jwtService.generateToken(username);
        return ResponseEntity.ok(new AuthResponse(
                true,
                "Registration successful",
                token,
                new UserResponse(username)
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        String username = request.getUsername().trim();
        User user = userRepository.findByUsername(username)
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        String token = jwtService.generateToken(user.getUsername());
        return ResponseEntity.ok(new AuthResponse(
                true,
                "Login successful",
                token,
                new UserResponse(user.getUsername())
        ));
    }
}
