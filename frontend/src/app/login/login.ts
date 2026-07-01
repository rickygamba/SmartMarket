import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root', // Sostituisce il vecchio app-component legandosi a index.html
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html', // Punta al tuo file html locale nella stessa cartella
  styleUrls: ['./login.css']

})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  onLogin(event: Event) {
    event.preventDefault();

    const loginData = {
      username: this.username,
      password: this.password
    };

    const url = 'http://localhost/SmartMarket/backend/login.php';

    this.http.post<any>(url, loginData).subscribe({
      next: (response) => {
        if (response.success) {
          this.errorMessage = '';
          alert('Login completato! Benvenuto ' + response.user.nome);
        }
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Impossibile connettersi al server di backend.';
        }
      }
    });
  }
}