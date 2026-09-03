import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  Router
} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import {
  AuthService
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
export class HeaderComponent implements OnInit, OnDestroy {

  username = '';
  saldo = 0;
  isProfileMenuOpen = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.username = user?.username ?? '';
          this.saldo = user ? Number(user.saldo) || 0 : 0;
        },
        error: () => {
          this.username = '';
          this.saldo = 0;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isProfileMenuOpen = false;
          this.router.navigate(['/login']);
        },
        error: () => {
          this.isProfileMenuOpen = false;
          this.router.navigate(['/login']);
        }
      });
  }
}
