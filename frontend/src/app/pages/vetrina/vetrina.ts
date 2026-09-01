import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

interface Prodotto {
  id: number;
  titolo: string;
  descrizione: string;
  prezzo: number;
  categoria: string;
  stato: string;
  img_principale: string;
  quantita: number;
}

interface ProdottiResponse {
  success: boolean;
  message?: string;
  id_utente?: number;
  totale_prodotti?: number;
  prodotti: Prodotto[];
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-vetrina',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './vetrina.html',
  styleUrl: './vetrina.css'
})
export class Vetrina implements OnInit, OnDestroy {

  prodotti: Prodotto[] = [];
  isLoading = true;
  errorMessage = '';

  private readonly apiUrl = 'http://localhost/SmartMarket/backend/get_user_products.php';
  private readonly deleteUrl = 'http://localhost/SmartMarket/backend/delete_product.php';

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef // 1. Iniettato ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaProdotti();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        filter(event => event.urlAfterRedirects === '/vetrina'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.caricaProdotti();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  caricaProdotti(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<ProdottiResponse>(this.apiUrl, { withCredentials: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.prodotti = response.prodotti ?? [];
          } else {
            this.prodotti = [];
            this.errorMessage = response.message || 'Errore nel caricamento dei prodotti.';
          }
          this.isLoading = false;
          this.cdr.detectChanges(); // Forza il refresh della vista
        },
        error: (error) => {
          this.prodotti = [];
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Impossibile caricare i prodotti.';
          this.cdr.detectChanges();
        }
      });
  }

  eliminaProdotto(id: number): void {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      return;
    }

    this.http.post<DeleteResponse>(
      this.deleteUrl,
      { id: id },
      { withCredentials: true }
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success) {
          // Rimuove l'elemento localmente creando una nuova referenza all'array
          this.prodotti = this.prodotti.filter(p => p.id !== id);
          
          // 2. Forziamo il Change Detection immediato
          this.cdr.detectChanges();
        } else {
          alert(response.message || 'Impossibile eliminare il prodotto.');
        }
      },
      error: (error) => {
        console.error('Errore backend:', error);
        alert(error.error?.message || 'Errore durante l\'eliminazione del prodotto.');
      }
    });
  }
}