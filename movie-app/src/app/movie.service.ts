import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:8080/api/movies';

  constructor(private http: HttpClient) {}

  // Helper to get the Basic Auth credentials
  private getHeaders(): HttpHeaders {
    const creds = localStorage.getItem('authCredentials') || '';
    return new HttpHeaders({
      'Authorization': creds,
      'Content-Type': 'application/json'
    });
  }

// Change Observable<any[]> to Observable<any>
  getMovies(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`, { 
      headers: this.getHeaders() 
    });
  }

  // Searches via your backend controller GET /api/movies/search/{title}
  searchOmdb(title: string, page: number = 1): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/search/${encodeURIComponent(title)}?page=${page}`, 
      { headers: this.getHeaders() }
    );
  }

// 2. Update getOmdbDetails
getOmdbDetails(imdbId: string): Observable<any> {
  return this.http.get(
    `http://localhost:8080/api/movies/MovieDetails/${imdbId}`, 
    { headers: this.getHeaders() } // <--- ADD THIS
  );
}

  addMovie(movie: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/AddMovie`, movie, { headers: this.getHeaders() });
  }

  addMoviesBatch(movies: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/AddMoviesBatch`, movies, { headers: this.getHeaders() });
  }

  deleteMovie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/DeleteMovie/${id}`, { headers: this.getHeaders() });
  }

  deleteMoviesBatch(ids: number[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/DeleteMoviesBatch`, { 
      headers: this.getHeaders(), 
      body: ids 
    });
  }

updateMovieRating(id: number, data: { userRating: number }): Observable<any> {
  // We send a PATCH request to update only the rating part of the movie record
  return this.http.patch(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
}
}