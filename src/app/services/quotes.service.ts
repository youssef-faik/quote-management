import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Quote } from '../models/quote.model';

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  private _quotes = new BehaviorSubject<Quote[]>([]);
  private storageReady = false;
  private STORAGE_KEY = 'quotes';

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
    this.storageReady = true;
    await this.loadQuotes();
  }

  async loadQuotes() {
    if (this.storageReady) {
      const quotes = await this.storage.get(this.STORAGE_KEY) || [];
      this._quotes.next(quotes);
    }
  }

  getQuotes(): Observable<Quote[]> {
    return this._quotes.asObservable();
  }

  async addQuote(content: string, author: string): Promise<void> {
    const newQuote: Quote = {
      id: uuidv4(),
      content,
      author,
      createdAt: new Date()
    };

    const currentQuotes = this._quotes.value;
    const updatedQuotes = [...currentQuotes, newQuote];
    
    this._quotes.next(updatedQuotes);
    await this.storage.set(this.STORAGE_KEY, updatedQuotes);
  }

  async updateQuote(quote: Quote): Promise<void> {
    const currentQuotes = this._quotes.value;
    const index = currentQuotes.findIndex(q => q.id === quote.id);
    
    if (index !== -1) {
      const updatedQuotes = [...currentQuotes];
      updatedQuotes[index] = quote;
      
      this._quotes.next(updatedQuotes);
      await this.storage.set(this.STORAGE_KEY, updatedQuotes);
    }
  }

  async deleteQuote(id: string): Promise<void> {
    const currentQuotes = this._quotes.value;
    const updatedQuotes = currentQuotes.filter(quote => quote.id !== id);
    
    this._quotes.next(updatedQuotes);
    await this.storage.set(this.STORAGE_KEY, updatedQuotes);
  }
}