import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';
// Importa interval e Subject da 'rxjs', mentre filter e takeUntil da 'rxjs/operators'
import { interval, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { HeaderComponent } from './components/header/header';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'SmartMarket';

  showHeader = true;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {

    // Controlla subito la rotta iniziale
    this.updateHeaderVisibility(this.router.url);

    // Controlla ogni cambio pagina
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {

        this.updateHeaderVisibility(
          event.urlAfterRedirects
        );

      });
  }

  ngOnInit(): void {
    // Verifica la sessione all'avvio
    this.authService.getSession().subscribe();

    // Refresh della sessione ogni 30 minuti per mantenere viva la sessione
    interval(30 * 60 * 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.authService.getSession().subscribe();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private updateHeaderVisibility(url: string): void {

    // Rimuove query parameters
    const currentRoute = url.split('?')[0];

    // Pagine senza header
    const hiddenRoutes = [
      '/',
      '/login',
      '/register'
    ];

    this.showHeader = !hiddenRoutes.includes(currentRoute);
  }
}