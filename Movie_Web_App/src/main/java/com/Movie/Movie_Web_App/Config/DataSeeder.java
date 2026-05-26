package com.Movie.Movie_Web_App.Config;

import com.Movie.Movie_Web_App.Entity.Role;
import com.Movie.Movie_Web_App.Entity.User;
import com.Movie.Movie_Web_App.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component 
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        if (userRepository.count() == 0) {
            
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();

            User regularUser = User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.USER)
                    .build();

            userRepository.saveAll(List.of(admin, regularUser));
            
            System.out.println("------------------------------------------------");
            System.out.println(">>> SEEDER: Admin and User accounts created!");
            System.out.println("------------------------------------------------");
        }
    }
}