import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:8080/api/Movies';

  constructor(private http: HttpClient) {}

  // Helper to get the Basic Auth credentials
  private getHeaders(): HttpHeaders {
    const creds = localStorage.getItem('authCredentials') || '';
    return new HttpHeaders({
      'Authorization': creds,
      'Content-Type': 'application/json'
    });
  }

  getMovies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Searches via your backend controller @GetMapping("/search/{title}")
searchOmdb(title: string): Observable<any> {
  return this.http.get(
    `http://localhost:8080/api/Movies/search/${encodeURIComponent(title)}`, 
    { headers: this.getHeaders() } // <--- ADD THIS
  );
}

// 2. Update getOmdbDetails
getOmdbDetails(imdbId: string): Observable<any> {
  return this.http.get(
    `http://localhost:8080/api/Movies/MovieDetails/${imdbId}`, 
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
}