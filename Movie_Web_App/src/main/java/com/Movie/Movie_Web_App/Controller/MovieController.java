package com.Movie.Movie_Web_App.Controller;

import org.springframework.web.bind.annotation.RestController;
import com.Movie.Movie_Web_App.Dto.MovieDto;
import com.Movie.Movie_Web_App.Dto.OmdbMovieItemResponse;
import com.Movie.Movie_Web_App.Dto.OmdbResponse;
import com.Movie.Movie_Web_App.Service.MovieService;
import lombok.AllArgsConstructor;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@CrossOrigin(origins = "http://localhost:4200") 
@RestController
@AllArgsConstructor
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/search/{title}")
    public ResponseEntity<OmdbResponse> search( @PathVariable String title, @RequestParam(defaultValue = "1") int page) {
    return ResponseEntity.ok(movieService.searchOmdb(title, page));
    }
    
    @GetMapping("/MovieDetails/{imdbId}")
    public ResponseEntity<OmdbMovieItemResponse> getDetails(@PathVariable String imdbId) {
        return ResponseEntity.ok(movieService.getMovieDetails(imdbId));
    }

    @GetMapping
    public ResponseEntity<Page<MovieDto>> getAllMovies(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(movieService.getAllMovies(page, size));
    }
    @PostMapping("/AddMovie")
    public ResponseEntity<MovieDto> addMovie(@RequestBody MovieDto movieDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.addMovie(movieDto));
    }
    @PostMapping("/AddMoviesBatch")
    public ResponseEntity<List<MovieDto>> addMovieBatch(@RequestBody List<MovieDto> movieDto) {
       return ResponseEntity.status(HttpStatus.CREATED).body(movieService.batchAddMovies(movieDto));
    }
    @DeleteMapping("/DeleteMovie/{movieId}")
    public ResponseEntity<Long> deleteMovie(@PathVariable Long movieId) {
       return ResponseEntity.ok(movieService.deleteMovie(movieId));
    }
    @DeleteMapping("/DeleteMoviesBatch")
    public ResponseEntity<List<Long>> DeleteMoviesBatch(@RequestBody List<Long> moviesIds) {
       return ResponseEntity.ok(movieService.batchDeleteMovies(moviesIds));
    }
    @PatchMapping("/{movieId}")
    public ResponseEntity<MovieDto> updateRating(@PathVariable Long movieId, @RequestBody MovieDto movieDto) {
        // We expect the movieDto to contain the new userRating
        return ResponseEntity.ok(movieService.updateMovieRating(movieId, movieDto.getUserRating()));
    }

}
