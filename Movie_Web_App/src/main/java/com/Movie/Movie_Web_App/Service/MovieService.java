package com.Movie.Movie_Web_App.Service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.Movie.Movie_Web_App.Dto.MovieDto;
import com.Movie.Movie_Web_App.Entity.Movie;
import com.Movie.Movie_Web_App.ExceptionHandling.DuplicateResourceException;
import com.Movie.Movie_Web_App.ExceptionHandling.ResourceNotFoundException;
import com.Movie.Movie_Web_App.Mapper.MoiveMapper;
import com.Movie.Movie_Web_App.Repository.MovieRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MovieService {

    private final MovieRepository movierepository;
    private final MoiveMapper moiveMapper;

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

    public List<MovieDto> getAllMovies(){
        List<Movie> movies= movierepository.findAll();
        return movies.stream()
                     .map(moiveMapper::toDto)
                     .toList();
    }
}
