package com.Movie.Movie_Web_App.Service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.Movie.Movie_Web_App.Dto.UserDto;
import com.Movie.Movie_Web_App.Entity.Role;
import com.Movie.Movie_Web_App.Entity.User;
import com.Movie.Movie_Web_App.ExceptionHandling.DuplicateResourceException;
import com.Movie.Movie_Web_App.ExceptionHandling.ResourceNotFoundException;
import com.Movie.Movie_Web_App.Mapper.UserMapper;
import com.Movie.Movie_Web_App.Repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserDto getUserByUsername(String username){   
       User user = userRepository.findByUsername(username)
                                 .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));   
       return userMapper.toDto(user);
    }

    public List<UserDto> getAllUsers(){
        return userRepository.findAll()
               .stream()
               .map(userMapper::toDto)
               .toList();
    }

    public UserDto RegisterNewUser(User user){
        if (userRepository.findByUsername(user.getUsername()).isPresent())
            {
                throw new DuplicateResourceException("Username : "+user.getUsername()+" already exists!");
            }
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }
    
    @PostConstruct
    public void seedDatabase() {
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
