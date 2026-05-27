package com.Movie.Movie_Web_App.Dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OmdbResponse {

    @JsonProperty("Search") private List<OmdbMovieItemResponse> search; 
    @JsonProperty("totalResults") private String totalResults;
    @JsonProperty("Response") private String response;
}

