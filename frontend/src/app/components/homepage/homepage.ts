import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class HomepageComponent {
  // Proprietà di esempio per verificare il corretto funzionamento
  welcomeMessage: string = 'Benvenuto in SmartMarket!';
  userSaldo: number = 0;
  isLoading: boolean = false;
}