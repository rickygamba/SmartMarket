import { Injectable } from '@angular/core';

export interface ElementoCarrello {
  id: number;
  titolo: string;
  prezzo: number;
  quantita: number; // Quantità nel carrello
  quantita_disponibile: number; // Max disponibilità a magazzino
  img_principale: string;
  venditore: string;
  categoria: string;
  stato?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarrelloService {
  private carrello: ElementoCarrello[] = [];

  constructor() {
    const salvato = localStorage.getItem('smartmarket_carrello');
    if (salvato) {
      try {
        this.carrello = JSON.parse(salvato);
      } catch (e) { this.carrello = []; }
    }
  }

  getCarrello(): ElementoCarrello[] { return this.carrello; }

  // Restituisce l'elemento se già nel carrello, utile per i controlli nel FE
  getInCarrello(id: number): ElementoCarrello | undefined {
    return this.carrello.find(item => item.id === id);
  }

  // --- MODIFICATO: Controllo disponibilità massima ---
  aggiungiProdotto(prodotto: any): boolean {
    // Verifichiamo che il prodotto abbia una quantità valida a magazzino
    const maxDispo = Number(prodotto.quantita);
    if (isNaN(maxDispo) || maxDispo <= 0) {
      alert("Prodotto esaurito, impossibile aggiungere.");
      return false;
    }

    const esistente = this.carrello.find(item => item.id === prodotto.id);

    if (esistente) {
      // Controllo: se aggiungendo 1 superiamo il max
      if (esistente.quantita + 1 > esistente.quantita_disponibile) {
        alert(`Disponibilità massima raggiunta (${esistente.quantita_disponibile} pz).`);
        return false; // Blocco l'aggiunta
      }
      esistente.quantita += 1;
    } else {
      // Primo inserimento
      this.carrello.push({
        id: prodotto.id,
        titolo: prodotto.titolo,
        prezzo: Number(prodotto.prezzo),
        quantita: 1,
        quantita_disponibile: maxDispo, // Salviamo il limite
        img_principale: prodotto.img_principale,
        venditore: prodotto.venditore,
        categoria: prodotto.categoria,
        stato: prodotto.stato
      });
    }

    this.salvaInStorage();
    return true; // Aggiunta riuscita
  }

  rimuoviProdotto(id: number): void {
    this.carrello = this.carrello.filter(item => item.id !== id);
    this.salvaInStorage();
  }

  // --- MODIFICATO: Controllo anche nella modifica manuale ---
  aggiornaQuantita(id: number, quantita: number): boolean {
    const item = this.carrello.find(i => i.id === id);
    if (item) {
      // Controllo limite superiore
      if (quantita > item.quantita_disponibile) {
        alert(`Spiacenti, sono disponibili solo ${item.quantita_disponibile} unità.`);
        item.quantita = item.quantita_disponibile; // Forzo al max
        this.salvaInStorage();
        return false;
      }

      item.quantita = quantita;

      // Controllo limite inferiore
      if (item.quantita <= 0) {
        this.rimuoviProdotto(id);
        return true;
      }
    }
    this.salvaInStorage();
    return true;
  }

  svuotaCarrello(): void {
    this.carrello = [];
    this.salvaInStorage();
  }

  private salvaInStorage(): void {
    localStorage.setItem('smartmarket_carrello', JSON.stringify(this.carrello));
  }
}