package com.Movie.Movie_Web_App.Dto;

import com.Movie.Movie_Web_App.Entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserDto {
    
    private Long id;
    private String username;
    private Role role;
    
}
