package com.Movie.Movie_Web_App.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.Movie.Movie_Web_App.Service.UserService;
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
public User findUser(@PathVariable String username)
{
    return userService.getUserByUsername(username);
}

@GetMapping("/findAll")
public List<User> findAllUsers()
{
    return userService.getAllUsers();
}

@PostMapping("/RegisterNewUser")
public User RegisterNewUser(@RequestBody User user) {

    return userService.RegisterNewUser(user);
}
    
    
}
