package com.Movie.Movie_Web_App.Controller;

import org.springframework.web.bind.annotation.RestController;

import com.Movie.Movie_Web_App.Entity.Movie;
import com.Movie.Movie_Web_App.Service.MovieService;
import lombok.AllArgsConstructor;

import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@AllArgsConstructor
@RequestMapping("/api/Movies")
public class MovieContoller {

    private final MovieService movieService;


    @GetMapping("/AllMovies")
    public List<Movie> AllMovies() {
        return movieService.getAllMovies();
    }
    @PostMapping("/AddMovie")
    public Movie addMovie(@RequestBody Movie movie) {
        movieService.addMovie(movie);
        return movie;
    }
    @PostMapping("/AddMoviesBatch")
    public List<Movie> addMovieBatch(@RequestBody List<Movie> movies) {
       return movieService.batchAddMovies(movies);
    }
    @DeleteMapping("/DeleteMovie/{movieId}")
    public Long deleteMovie(@PathVariable Long movieId) {
       return movieService.deleteMovie(movieId);
    }
    @DeleteMapping("/DeleteMoviesBatch")
    public List<Long> DeleteMoviesBatch(@RequestBody List<Long> moviesIds) {
       return movieService.batchDeleteMovies(moviesIds);
    }


    

}
