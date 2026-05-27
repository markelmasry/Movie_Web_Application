import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getAllUsers(): Observable<any[]> {
    const savedCredentials = localStorage.getItem('authCredentials') || '';

    const headers = new HttpHeaders({
      'Authorization': savedCredentials
    });
    
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers });
  }
}