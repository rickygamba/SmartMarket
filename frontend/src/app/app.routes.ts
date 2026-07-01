import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register'; // <-- 1. Aggiungi questa riga

export const routes: Routes = [
  // Quando l'URL è vuoto (es. http://localhost:4200), reindirizza automaticamente a /login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Definisce la rotta per il login
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // In futuro qui potrai aggiungere le altre pagine, ad esempio:
  // { path: 'dashboard', component: DashboardComponent }
];