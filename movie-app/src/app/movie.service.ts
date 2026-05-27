import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:8080/api/Movies';

  constructor(private http: HttpClient) { }

  // Generates Basic Auth headers for the backend
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:admin123'),
      'Content-Type': 'application/json'
    });
  }

  getMovies(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addMovie(movie: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/AddMovie`, movie, { headers: this.getHeaders() });
  }

  deleteMovie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/DeleteMovie/${id}`, { headers: this.getHeaders() });
  }
}