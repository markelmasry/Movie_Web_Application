package com.Movie.Movie_Web_App.Service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.Movie.Movie_Web_App.Dto.UserDto;
import com.Movie.Movie_Web_App.Entity.User;
import com.Movie.Movie_Web_App.ExceptionHandling.DuplicateResourceException;
import com.Movie.Movie_Web_App.ExceptionHandling.ResourceNotFoundException;
import com.Movie.Movie_Web_App.Mapper.UserMapper;
import com.Movie.Movie_Web_App.Repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }
}