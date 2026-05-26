package com.Movie.Movie_Web_App.ExceptionHandling;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { 
        super(message); 
    }
}