package com.Movie.Movie_Web_App.Controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.Movie.Movie_Web_App.Service.UserService;
import com.Movie.Movie_Web_App.Dto.UserDto;
import com.Movie.Movie_Web_App.Dto.LoginRequest;
import com.Movie.Movie_Web_App.Entity.User;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@AllArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<UserDto> findUser(@PathVariable String username){
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }
    @GetMapping("/all")
    public ResponseEntity<List<UserDto>> findAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }
    @PostMapping("/register")
    public ResponseEntity<UserDto> registerNewUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.RegisterNewUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto> login(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword()));
    }

}
