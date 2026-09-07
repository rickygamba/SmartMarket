import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { CarrelloService } from '../../services/carrello.service';

export interface ProdottoHome {
  id: number;
  titolo: string;
  descrizione: string;
  prezzo: number;
  categoria: string;
  stato: string; // Rappresenta le condizioni del prodotto (es. Nuovo, Come nuovo, Usato)
  img_principale: string;
  quantita: number;
  venditore: string;
}

export interface HomeProdottiResponse {
  success: boolean;
  message?: string;
  prodotti: ProdottoHome[];
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css'
})
export class Homepage implements OnInit, OnDestroy {

  prodotti: ProdottoHome[] = [];
  isLoading = true;
  errorMessage = '';

  // LISTE DROPDOWN
  categories = ['Abbigliamento', 'Scarpe', 'Elettronica', 'Casa', 'Accessori', 'Altro'];
  condizioni = ['Nuovo', 'Come Nuovo', 'Buone Condizioni', 'Usato'];

  // FILTRI DINAMICI
  filtroTitolo: string = '';
  filtroCategoria: string = '';
  filtroStato: string = ''; // Nuovo filtro condizione
  filtroPrezzoMax: number | null = null;

  private readonly apiUrl = 'http://localhost/SmartMarket/backend/get_all_products.php';
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private carrelloService: CarrelloService // Iniezione del CarrelloService
  ) {}

  ngOnInit(): void {
    this.caricaProdotti();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        filter(event => event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/home' || event.urlAfterRedirects === '/homepage'),
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

    this.http.get<HomeProdottiResponse>(this.apiUrl, { withCredentials: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.prodotti = response.prodotti ?? [];
          } else {
            this.prodotti = [];
            this.errorMessage = response.message || 'Errore nel caricamento del catalogo.';
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.prodotti = [];
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Impossibile caricare i prodotti.';
          this.cdr.detectChanges();
        }
      });
  }

  get prodottiFiltrati(): ProdottoHome[] {
    return this.prodotti.filter(prod => {
      // 1. Filtro Titolo
      const matchTitolo = !this.filtroTitolo || 
        prod.titolo.toLowerCase().includes(this.filtroTitolo.trim().toLowerCase());

      // 2. Filtro Categoria
      const matchCategoria = !this.filtroCategoria || 
        prod.categoria.toLowerCase() === this.filtroCategoria.toLowerCase();

      // 3. Filtro Condizioni / Stato
      const matchStato = !this.filtroStato || 
        prod.stato.toLowerCase() === this.filtroStato.toLowerCase();

      // 4. Filtro Prezzo Max
      const prezzoMax = (this.filtroPrezzoMax !== null && this.filtroPrezzoMax !== undefined && (this.filtroPrezzoMax as any) !== '') 
        ? Number(this.filtroPrezzoMax) 
        : null;

      const prodPrezzo = Number(prod.prezzo);
      const matchPrezzo = prezzoMax === null || isNaN(prezzoMax) || prodPrezzo <= prezzoMax;

      return matchTitolo && matchCategoria && matchStato && matchPrezzo;
    });
  }

  resetFiltri(): void {
    this.filtroTitolo = '';
    this.filtroCategoria = '';
    this.filtroStato = '';
    this.filtroPrezzoMax = null;
  }

aggiungiAlCarrello(prodotto: ProdottoHome): void {
    const aggiunto = this.carrelloService.aggiungiProdotto(prodotto);
    
    if (aggiunto) {
      // Alert rimosso o sostituito con una notifica meno invasiva (toast)
      console.log(`"${prodotto.titolo}" aggiunto.`);
      // alert(`"${prodotto.titolo}" aggiunto al carrello!`); // Opzionale
    }
    // Se 'aggiunto' è false, il servizio ha già mostrato l'alert del blocco.
  }

  // --- NUOVO: Metodo per controllare se disabilitare il tasto nell'HTML ---
  isMaxRaggiunto(prodotto: ProdottoHome): boolean {
    // Se esaurito a magazzino, blocco subito
    if (prodotto.quantita <= 0) return true;

    // Controllo se è già nel carrello
    const itemInCarrello = this.carrelloService.getInCarrello(prodotto.id);
    
    // Se è nel carrello, controllo se la qty nel carrello ha raggiunto la qty di magazzino
    if (itemInCarrello) {
      return itemInCarrello.quantita >= prodotto.quantita;
    }

    return false;
  }
}