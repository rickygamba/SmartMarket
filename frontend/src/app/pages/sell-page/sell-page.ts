import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sell-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sell-page.html',
  styleUrl: './sell-page.css',
})
export class SellPage {
  sellForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  isSubmitting = false;
  isAiAnalyzing = false; // <-- Stato per la barra di caricamento AI
  errorMessage = '';

  // Risultato dell'analisi dell'AI
  aiFeedback: { success: boolean; message: string; confidenza?: number } | null = null;

  categories = ['Abbigliamento', 'Scarpe', 'Elettronica', 'Casa', 'Accessori', 'Altro'];
  conditions = ['Nuovo con cartellino', 'Come nuovo', 'Buone condizioni', 'Usato'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.sellForm = this.fb.group({
      titolo: ['', [Validators.required, Validators.minLength(3)]],
      descrizione: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['', Validators.required],
      condizione: ['', Validators.required],
      prezzo: ['', [Validators.required, Validators.min(0.5)]],
      quantita: [1, [Validators.required, Validators.min(1)]]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.sellForm.invalid || !this.selectedFile) {
      this.errorMessage = 'Compila tutti i campi obbligatori e inserisci un\'immagine.';
      return;
    }

    this.isSubmitting = true;
    this.isAiAnalyzing = true; // Mostra la barra di caricamento AI
    this.errorMessage = '';
    this.aiFeedback = null;

    const formData = new FormData();
    formData.append('titolo', this.sellForm.get('titolo')?.value);
    formData.append('descrizione', this.sellForm.get('descrizione')?.value);
    formData.append('categoria', this.sellForm.get('categoria')?.value);
    formData.append('condizione', this.sellForm.get('condizione')?.value);
    formData.append('prezzo', this.sellForm.get('prezzo')?.value);
    formData.append('quantita', this.sellForm.get('quantita')?.value);
    formData.append('immagine', this.selectedFile);

    this.http.post<any>('http://localhost/SmartMarket/backend/add_product.php', formData, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.isAiAnalyzing = false;

          if (res.success) {
            // Risultato positivo: mostra messaggio verde e poi reindirizza
            this.aiFeedback = {
              success: true,
              message: res.message || 'Prodotto approvato e coerente con la foto!',
              confidenza: res.confidenza_ai
            };
            setTimeout(() => {
              this.router.navigate(['/homepage']);
            }, 3000);
          } else {
            // Risultato negativo dall'AI: mostra box rosso spiegando il motivo
            this.isSubmitting = false;
            this.aiFeedback = {
              success: false,
              message: res.message || 'Il prodotto non ha superato i controlli di qualità.'
            };
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.isAiAnalyzing = false;
          this.errorMessage = 'Errore di connessione durante la verifica del server.';
          console.error(err);
        }
      });
  }
}