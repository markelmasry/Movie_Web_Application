package com.Movie.Movie_Web_App.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MovieDto {
    
    private long id;
    private String imdbId;
    private String title;
    private String movieYear;
    private String genre;
    private String director;
    private String plot;
    private String poster;
    private Double userRating;

}
