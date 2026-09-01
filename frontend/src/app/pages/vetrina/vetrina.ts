import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

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
export class Vetrina implements OnInit {

  prodotti: Prodotto[] = [];

  isLoading = true;

  errorMessage = '';

  private readonly apiUrl =
    'http://localhost/SmartMarket/backend/get_user_products.php';


  constructor(
    private http: HttpClient
  ) {}


  ngOnInit(): void {

    console.log('Vetrina: caricamento prodotti');

    this.caricaProdotti();
  }


  caricaProdotti(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<ProdottiResponse>(
      this.apiUrl,
      {
        withCredentials: true
      }
    )
    .subscribe({

      next: (response) => {

        console.log(
          'Risposta get_user_products:',
          response
        );

        if (response.success) {

          this.prodotti = response.prodotti ?? [];

          console.log(
            'Prodotti caricati:',
            this.prodotti
          );

        } else {

          this.prodotti = [];

          this.errorMessage =
            response.message ||
            'Errore nel caricamento dei prodotti.';
        }

        this.isLoading = false;
      },


      error: (error) => {

        console.error(
          'Errore HTTP caricamento prodotti:',
          error
        );

        this.prodotti = [];

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Impossibile caricare i prodotti.';
      }

    });
  }
}