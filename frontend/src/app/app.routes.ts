import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register'; 
import { Homepage } from './pages/homepage/homepage';
import { SellPage } from './pages/sell-page/sell-page';
import { Vetrina } from './pages/vetrina/vetrina';
import { AuthGuard } from './guards/auth.guard';
import { Prodotto } from './pages/prodotto/prodotto';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'homepage', component: Homepage, canActivate: [AuthGuard] },
  { path: 'vendi', component: SellPage, canActivate: [AuthGuard] },
  { path: 'vetrina', component: Vetrina, canActivate: [AuthGuard] },
  { path: 'prodotto/:id', component: Prodotto }
];