package com.Movie.Movie_Web_App.Mapper;

import com.Movie.Movie_Web_App.Dto.MovieDto;
import com.Movie.Movie_Web_App.Entity.Movie;

public class MoiveMapper {
    
    public MovieDto toDto(Movie movie)
    {
        if (movie == null) return null;
        
        return MovieDto.builder()
               .id(movie.getId())
               .imdbId(movie.getImdbId())
               .title(movie.getTitle())
               .movieYear(movie.getMovieYear())
               .genre(movie.getGenre())
               .director(movie.getDirector())
               .plot(movie.getPlot())
               .poster(movie.getPoster())
               .userRating(movie.getUserRating())
               .build();
    }
   
    public Movie toEntity(MovieDto moviedto)
    {
        if (moviedto == null) return null;
        
        return Movie.builder()
               .id(moviedto.getId())
               .imdbId(moviedto.getImdbId())
               .title(moviedto.getTitle())
               .movieYear(moviedto.getMovieYear())
               .genre(moviedto.getGenre())
               .director(moviedto.getDirector())
               .plot(moviedto.getPlot())
               .poster(moviedto.getPoster())
               .userRating(moviedto.getUserRating())
               .build();
    }
}
