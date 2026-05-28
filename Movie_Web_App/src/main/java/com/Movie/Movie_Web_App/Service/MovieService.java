package com.Movie.Movie_Web_App.Service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.Movie.Movie_Web_App.Dto.MovieDto;
import com.Movie.Movie_Web_App.Dto.OmdbMovieItemResponse;
import com.Movie.Movie_Web_App.Dto.OmdbResponse;
import com.Movie.Movie_Web_App.Entity.Movie;
import com.Movie.Movie_Web_App.ExceptionHandling.DuplicateResourceException;
import com.Movie.Movie_Web_App.ExceptionHandling.ResourceNotFoundException;
import com.Movie.Movie_Web_App.Mapper.MovieMapper;
import com.Movie.Movie_Web_App.Repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movierepository;
    private final MovieMapper moiveMapper;
    private final RestTemplate restTemplate;

    @Value("${omdb.api.key}")
    private String apiKey;

public OmdbResponse searchOmdb(String title ,int page) {
    try {
        String url = "https://www.omdbapi.com/?s=" + title + "&apikey=" + apiKey + "&page=" + page;
        System.out.println("Calling URL: " + url);
        return restTemplate.getForObject(url, OmdbResponse.class);
    } catch (Exception e) {
        e.printStackTrace();
        throw e;
    }
}
// In MovieService.java
public OmdbMovieItemResponse getMovieDetails(String imdbId) {
    // We use 'i=' to get the full details for a specific ID
    String url = "https://www.omdbapi.com/?i=" + imdbId + "&plot=full&apikey=" + apiKey;
    return restTemplate.getForObject(url, OmdbMovieItemResponse.class);
}

    public MovieDto addMovie(MovieDto movie){
        movierepository.findByImdbId(movie.getImdbId())
                       .ifPresent(existing ->{ throw new DuplicateResourceException("Movie already exists: " + existing.getTitle());});
        Movie savedMovie = movierepository.save(moiveMapper.toEntity(movie));
        return moiveMapper.toDto(savedMovie);
    }
    
    public Long deleteMovie(Long movieId){
        Movie movie = movierepository.findById(movieId)
                     .orElseThrow(() -> new ResourceNotFoundException("Movie not found with ID: " + movieId));
        movierepository.delete(movie);
        return movieId;
    }

    public List<MovieDto> batchAddMovies(List<MovieDto> moviesDto){
        List<Movie> movies = moviesDto.stream()
                                      .map(moiveMapper::toEntity)
                                      .toList();
       for(Movie movie: movies)
       {
        movierepository.findByImdbId(movie.getImdbId())
                       .ifPresent(existing->{throw new DuplicateResourceException("Movie already exists: " + existing.getTitle());});
       }
        movierepository.saveAll(movies);
        return movies
              .stream()
              .map(moiveMapper::toDto)
              .toList();
    }

    public List<Long> batchDeleteMovies(List<Long> ids){
        for(Long movieId : ids )
        {
           Movie movie = movierepository.findById(movieId)
                                        .orElseThrow(() -> new ResourceNotFoundException("Movie not found with ID: " + movieId));
            movierepository.delete(movie);
        }
        return ids;
    }

    public MovieDto getMovie(Long movieId){
        Movie movie=  movierepository.findById(movieId)
                                     .orElseThrow(()->new ResourceNotFoundException("Movie not found with ID: " + movieId));
        return moiveMapper.toDto(movie);
    }

    public MovieDto rateMovie(Long movieId,Double rating){
        Movie movie= movierepository.findById(movieId)
                                    .orElseThrow(()->new ResourceNotFoundException("Movie not found with ID: " + movieId));
        movie.setUserRating(rating);
        movierepository.save(movie);
        return moiveMapper.toDto(movie);
    }

    public Page<MovieDto> getAllMovies(int page, int size) {
    Pageable pageable = PageRequest.of(page, size);

    return movierepository.findAll(pageable)
            .map(moiveMapper::toDto); 
    }
    
    public MovieDto updateMovieRating(Long movieId, Double newRating) {
    
        Movie movie = movierepository.findById(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with ID: " + movieId));

        movie.setUserRating(newRating);
        Movie updatedMovie = movierepository.save(movie);
        return moiveMapper.toDto(updatedMovie);
    }
}
