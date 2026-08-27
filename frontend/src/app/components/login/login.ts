import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  private readonly apiUrl = 'http://localhost/SmartMarket/backend/login_process.php';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Inserisci le credenziali di accesso.';
      return;
    }

    this.isLoading = true;

    this.http.post<any>(this.apiUrl, this.loginForm.value)
      .pipe(
        catchError((err) => {
          let errorMsg = 'Credenziali non valide.';
          if (err.error && err.error.message) {
            errorMsg = err.error.message;
          }
          return of({ success: false, message: errorMsg });
        })
      )
      .subscribe((response) => {
        this.isLoading = false;

        if (response.success) {
          this.successMessage = 'Accesso effettuato! Reindirizzamento...';
          
          if (response.token) {
            localStorage.setItem('userToken', response.token);
          }

          setTimeout(() => {
            this.router.navigate(['/homepage']);
          }, 1500);
        } else {
          this.errorMessage = response.message;
          this.cdr.detectChanges();
        }
      });
  }
}