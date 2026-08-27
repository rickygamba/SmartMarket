import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  nome: string;
  cognome: string;
  username: string;
  email: string;
  saldo: number;
}

export interface SessionResponse {
  success: boolean;
  loggedIn: boolean;
  user?: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost/SmartMarket/backend';

  constructor(private http: HttpClient) {}

  getSession(): Observable<SessionResponse> {

    return this.http.get<SessionResponse>(
      `${this.apiUrl}/session.php`,
      {
        withCredentials: true
      }
    );

  }
}