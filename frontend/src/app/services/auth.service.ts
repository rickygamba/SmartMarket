import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

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

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost/SmartMarket/backend';
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login_process.php`,
      { identifier, password },
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        if (response.success && response.user) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  getSession(): Observable<SessionResponse> {

    return this.http.get<SessionResponse>(
      `${this.apiUrl}/session.php`,
      {
        withCredentials: true
      }
    ).pipe(
      tap((response) => {
        this.currentUserSubject.next(
          response.success && response.user ? response.user : null
        );
      })
    );

  }
}