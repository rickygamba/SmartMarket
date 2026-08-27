import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  AuthService,
  User
} from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {

  username = '';
  saldo = 0;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.authService.getSession().subscribe({

      next: (response) => {

        if (response.success && response.user) {

          this.username =
            response.user.username;

          this.saldo =
            Number(response.user.saldo);

        }

      },

      error: (error) => {

        console.error(
          'Errore nel recupero della sessione:',
          error
        );

      }

    });

  }
}