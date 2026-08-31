import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
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

    this.authService.login(
      this.loginForm.value.identifier,
      this.loginForm.value.password
    )
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