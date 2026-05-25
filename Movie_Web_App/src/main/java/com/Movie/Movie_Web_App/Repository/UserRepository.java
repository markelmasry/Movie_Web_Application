package com.Movie.Movie_Web_App.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.Movie.Movie_Web_App.Entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);

}
