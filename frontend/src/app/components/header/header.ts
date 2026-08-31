import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  Router
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
  isProfileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.authService.currentUser$.subscribe((user) => {
      this.username = user?.username ?? '';
      this.saldo = user ? Number(user.saldo) : 0;
    });

    this.authService.getSession().subscribe({

      error: () => undefined

    });

  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}