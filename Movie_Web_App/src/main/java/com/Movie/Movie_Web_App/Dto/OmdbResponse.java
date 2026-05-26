package com.Movie.Movie_Web_App.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OmdbResponse {

    @JsonProperty("Title") private String title;
    @JsonProperty("Year") private String year;
    @JsonProperty("imdbID") private String imdbId;
    @JsonProperty("Genre") private String genre;
    @JsonProperty("Director") private String director;
    @JsonProperty("Plot") private String plot;
    @JsonProperty("Poster") private String poster;
    @JsonProperty("Response") private String response;
}

