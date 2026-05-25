package com.Movie.Movie_Web_App.Service;


import java.util.List;

import org.springframework.stereotype.Service;

import com.Movie.Movie_Web_App.Entity.Role;
import com.Movie.Movie_Web_App.Entity.User;
import com.Movie.Movie_Web_App.Repository.UserRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserByUsername(String username)
    {   
       return userRepository.findByUsername(username)
       .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public List<User> getAllUsers()
    {
        return userRepository.findAll();
    }

    public User registNewUser(User user)
    {
        return userRepository.save(user);
    }
    
    @PostConstruct
    public void seedDatabase() 
    {
        if(userRepository.count()==0)
            {
                User admin = User.builder()
                             .username("admin")
                             .password("admin123")
                             .role(Role.ADMIN)
                             .build();

                User regularUser = User.builder()
                            .username("user")
                            .password("user123")
                            .role(Role.USER)
                            .build();

                userRepository.saveAll(List.of(admin,regularUser));
                System.out.println(">>> Database seeded with Admin and Regular User accounts.");
            }
        
    }
}
