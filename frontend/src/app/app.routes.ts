import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register'; 
import { HomepageComponent } from './pages/homepage/homepage';
import { SellPage } from './pages/sell-page/sell-page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {path: 'homepage', component: HomepageComponent},
  { path: 'vendi', component: SellPage } 
];