import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertController, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonFab,
  IonFabButton, IonHeader, IonIcon, IonInput, IonItem,
  IonLabel, IonList, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { Quote } from '../models/quote.model';
import { QuotesService } from '../services/quotes.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AsyncPipe,
    DatePipe,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonFab,
    IonFabButton,
    IonInput
  ],
})
export class HomePage implements OnInit {
  quotes$: Observable<Quote[]>;
  quoteForm: FormGroup;
  showForm = false;
  isEditing = false;
  currentEditingQuote: Quote | null = null;

  constructor(
    private quotesService: QuotesService,
    private fb: FormBuilder,
    private alertController: AlertController
  ) {
    this.quotes$ = this.quotesService.getQuotes();
    this.quoteForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]],
      author: ['', [Validators.required]]
    });
    
    addIcons({ 
      'add-outline': addOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    // Nothing additional needed here as we set up the quotes$ observable in the constructor
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.quoteForm.reset();
    this.isEditing = false;
    this.currentEditingQuote = null;
  }

  async saveQuote() {
    if (this.quoteForm.valid) {
      const { content, author } = this.quoteForm.value;

      if (this.isEditing && this.currentEditingQuote) {
        const updatedQuote: Quote = {
          ...this.currentEditingQuote,
          content,
          author
        };
        await this.quotesService.updateQuote(updatedQuote);
      } else {
        await this.quotesService.addQuote(content, author);
      }

      this.resetForm();
      this.showForm = false;
    }
  }

  editQuote(quote: Quote) {
    this.isEditing = true;
    this.currentEditingQuote = quote;
    this.quoteForm.setValue({
      content: quote.content,
      author: quote.author
    });
    this.showForm = true;
  }

  async deleteQuote(quote: Quote) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: `Are you sure you want to delete this quote by ${quote.author}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Delete',
          handler: () => {
            this.quotesService.deleteQuote(quote.id);
          }
        }
      ]
    });

    await alert.present();
  }
}
