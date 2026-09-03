import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-prodotto',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './prodotto.html',
  styleUrls: ['./prodotto.css']
})
export class Prodotto implements OnInit {

  prodotto: any = null;
  immagini: string[] = [];
  selectedImageIndex: number = 0;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      console.log('ID prodotto ricevuto:', id);

      if (!id) {
        this.prodotto = null;
        this.loading = false;
        this.errorMessage = 'Nessun ID specificato nell\'URL.';
        this.cdr.detectChanges();
        return;
      }

      this.caricaDettaglioProdotto(id);
    });
  }

  caricaDettaglioProdotto(id: string): void {
    this.loading = true;
    this.prodotto = null;
    this.immagini = [];
    this.selectedImageIndex = 0;
    this.errorMessage = '';

    console.log('Richiedo prodotto:', id);

    this.http
      .get<any>(
        `http://localhost/SmartMarket/backend/get_product_detail.php?id=${encodeURIComponent(id)}`,
        {
          withCredentials: true
        }
      )
      .subscribe({
        next: (res) => {
          console.log('Risposta PHP:', res);

          if (res?.success && res?.prodotto) {
            this.prodotto = res.prodotto;
            this.errorMessage = '';

            // Popola l'array immagini per il carosello
            if (res.prodotto.immagini && Array.isArray(res.prodotto.immagini) && res.prodotto.immagini.length > 0) {
              this.immagini = res.prodotto.immagini;
            } else if (res.prodotto.img_principale) {
              this.immagini = [res.prodotto.img_principale];
            }
          } else {
            this.prodotto = null;
            this.errorMessage = res?.message || 'Prodotto non trovato.';
          }

          this.loading = false;
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Errore durante il recupero del prodotto:', err);

          this.prodotto = null;
          this.loading = false;
          this.errorMessage = err.error?.message || 'Errore di connessione al server.';
          this.cdr.detectChanges();
        }
      });
  }

  // --- Controlli Carosello ---
  selectImage(index: number): void {
    this.selectedImageIndex = index;
    this.cdr.detectChanges();
  }

  nextImage(): void {
    if (this.immagini.length > 0) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.immagini.length;
      this.cdr.detectChanges();
    }
  }

  prevImage(): void {
    if (this.immagini.length > 0) {
      this.selectedImageIndex = (this.selectedImageIndex - 1 + this.immagini.length) % this.immagini.length;
      this.cdr.detectChanges();
    }
  }

  aggiungiAlCarrello(): void {
    console.log('Aggiunto al carrello:', this.prodotto);
  }
}