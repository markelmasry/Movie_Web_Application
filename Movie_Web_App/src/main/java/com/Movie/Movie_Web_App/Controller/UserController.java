package com.Movie.Movie_Web_App.Controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.Movie.Movie_Web_App.Service.UserService;
import com.Movie.Movie_Web_App.Dto.UserDto;
import com.Movie.Movie_Web_App.Entity.User;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@AllArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/find/{username}")
    public ResponseEntity<UserDto> findUser(@PathVariable String username){
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }
    @GetMapping("/findAll")
    public ResponseEntity<List<UserDto>> findAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }
    @PostMapping("/RegisterNewUser")
    public ResponseEntity<UserDto> RegisterNewUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.RegisterNewUser(user));
    }             
}
