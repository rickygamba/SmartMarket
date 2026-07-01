import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { LoginComponent } from './app/login/login'; // <-- Cambia l'import qui

// Avvia l'applicazione usando direttamente il tuo componente Login
bootstrapApplication(LoginComponent, appConfig)
  .catch((err) => console.error(err));