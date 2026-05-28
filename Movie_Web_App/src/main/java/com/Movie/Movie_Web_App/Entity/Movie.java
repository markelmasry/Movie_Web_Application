package com.Movie.Movie_Web_App.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movies")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Movie {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column(unique = true, nullable = false)
    private String imdbId;

    private String title;
    private String movieYear;
    private String genre;
    private String director;

    @Column(length = 1000) // Plots can be long
    private String plot;
    private String poster;
    private Double imdbRating; 
    private Double userRating;

}
