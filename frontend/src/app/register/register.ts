import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Definizione dei campi del form e delle regole di validazione
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Metodo chiamato al click sul pulsante Invia
  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Dati inviati con successo:', this.registerForm.value);
      // Qui inserirai la chiamata al tuo servizio/backend per registrare l'utente
    } else {
      console.log('Il form contiene errori');
    }
  }
}