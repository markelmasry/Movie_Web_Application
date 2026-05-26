package com.Movie.Movie_Web_App.ExceptionHandling;

public class DuplicateResourceException extends RuntimeException{
    public DuplicateResourceException(String message){
        super(message);
    }
}
