import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';
import { filter } from 'rxjs/operators';

import { HeaderComponent } from './components/header/header';

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
export class AppComponent {

  title = 'SmartMarket';

  showHeader = true;

  constructor(private router: Router) {

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