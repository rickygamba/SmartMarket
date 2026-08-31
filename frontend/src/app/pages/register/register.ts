import { Component, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  private readonly apiUrl = 'http://localhost/SmartMarket/backend/register.php';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6), 
        (control: AbstractControl) => this.passwordValidator(control)
      ]]
    });
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const hasUpperCase = /[A-Z]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasUpperCase || !hasSpecialChar) {
      return { customPasswordError: true };
    }
    return null;
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Compila correttamente tutti i campi richiesti.';
      return;
    }

    this.isLoading = true;

    this.http.post<any>(this.apiUrl, this.registerForm.value)
      .pipe(
        catchError((err) => {
          let errorMsg = 'Email o Username già registrati.';
          if (err.error && err.error.message) {
            errorMsg = err.error.message;
          }
          return of({ success: false, message: errorMsg });
        })
      )
      .subscribe((response) => {
        this.isLoading = false;

        if (response.success) {
          this.successMessage = 'Registrazione completata con successo! Reindirizzamento al login...';
          this.registerForm.reset();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message;
          this.cdr.detectChanges();
        }
      });
  }
}