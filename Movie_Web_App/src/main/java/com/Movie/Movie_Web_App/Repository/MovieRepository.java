package com.Movie.Movie_Web_App.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.Movie.Movie_Web_App.Entity.Movie;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie,Long>{
    Optional<Movie> findByImdbId(String imdbId);
}
    