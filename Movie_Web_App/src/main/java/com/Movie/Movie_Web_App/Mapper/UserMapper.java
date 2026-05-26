package com.Movie.Movie_Web_App.Mapper;

import org.springframework.stereotype.Component;
import com.Movie.Movie_Web_App.Dto.UserDto;
import com.Movie.Movie_Web_App.Entity.User;

@Component
public class UserMapper {
    public UserDto toDto(User user)
    {
        if (user == null) return null;
        return UserDto.builder()
               .id(user.getId())
               .username(user.getUsername())
               .role(user.getRole())
               .build();
    }
    
    public User toEntity(UserDto userDto)
    {
        if (userDto ==null) return null;

        return User.builder()
                .id(userDto.getId())
                .username(userDto.getUsername())
                .role(userDto.getRole())
                .build();
    }
}
