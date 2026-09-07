import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarrelloService, ElementoCarrello } from '../../services/carrello.service';

@Component({
  selector: 'app-carrello',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  templateUrl: './carrello.html',
  styleUrls: ['./carrello.css']
})
export class Carrello implements OnInit {

  elementiCarrello: ElementoCarrello[] = [];

  constructor(
    private carrelloService: CarrelloService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaCarrello();
  }

  caricaCarrello(): void {
    this.elementiCarrello = this.carrelloService.getCarrello();
  }

  // Calcolo del totale dei prodotti
  get totaleProdotti(): number {
    return this.elementiCarrello.reduce((acc, item) => acc + (item.prezzo * item.quantita), 0);
  }

  // Calcolo del totale complessivo (prodotti + spedizione)
  get totaleOrdine(): number {
    if (this.elementiCarrello.length === 0) return 0;
    return this.totaleProdotti;
  }

  // Incrementa quantità rispettando il limite massimo disponibile
  aumentaQuantita(item: ElementoCarrello): void {
    if (item.quantita < item.quantita_disponibile) {
      this.carrelloService.aggiornaQuantita(item.id, item.quantita + 1);
      this.caricaCarrello();
    }
  }

  // Decrementa quantità
  diminuisciQuantita(item: ElementoCarrello): void {
    this.carrelloService.aggiornaQuantita(item.id, item.quantita - 1);
    this.caricaCarrello();
  }

  // Rimuovi singolo prodotto
  rimuoviProdotto(id: number): void {
    this.carrelloService.rimuoviProdotto(id);
    this.caricaCarrello();
  }

  // Svuota carrello intero
  svuotaCarrello(): void {
    this.carrelloService.svuotaCarrello();
    this.caricaCarrello();
  }
}