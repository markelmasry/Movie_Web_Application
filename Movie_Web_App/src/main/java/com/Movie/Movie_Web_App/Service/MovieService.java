package com.Movie.Movie_Web_App.Service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.Movie.Movie_Web_App.Entity.Movie;
import com.Movie.Movie_Web_App.Repository.MovieRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MovieService {


    private final MovieRepository movierepository;



    // ==========================================
    // 1. LOCAL DATABASE CUD (Admin Features)
    // ==========================================
    public Movie addMovie(Movie movie)
    {
         movierepository.findByImdbId(movie.getImdbId())
        .ifPresent(existing ->{
            throw new RuntimeException("Movie already exists: " + existing.getTitle());
        });
        
        return movierepository.save(movie);
    }
    
    public Long deleteMovie(Long movieId)
    {
         return movierepository.findById(movieId)
         .map(movie -> {
           movierepository.delete(movie);
           return movie.getId();
          })
         .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + movieId));
    
    }

    public List<Movie> batchAddMovies(List<Movie> movies)
    {
       for(Movie movie: movies)
       {
        movierepository.findByImdbId(movie.getImdbId())
        .ifPresent(existing->{throw new RuntimeException("Movie already exists: " + existing.getTitle());  
        });
       }
        return movierepository.saveAll(movies);
    }

    public List<Long> batchDeleteMovies(List<Long> ids)
    {
        for(Long movieId : ids )
        {
           Movie movie = movierepository.findById(movieId)
            .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + movieId));
           
            movierepository.delete(movie);
        }
        return ids;
    }

    public Movie getMovie(Long movieId)
    {
        return  movierepository.findById(movieId)
                .orElseThrow(()->new RuntimeException("Movie not found with ID: " + movieId));


    }

    public Movie rateMovie(Long movieId,Double rating)
    {
        Movie movie= movierepository.findById(movieId)
              .orElseThrow(()->new RuntimeException("Movie not found with ID: " + movieId));
        
        movie.setUserRating(rating);
        return movierepository.save(movie);

    }
}
