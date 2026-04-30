import { Injectable, signal, computed } from '@angular/core';
import { FinancialProduct } from '../models/financial-product.model';

export type StoreStatus = 'idle' | 'loading' | 'error';

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  private readonly _products = signal<FinancialProduct[]>([]);
  private readonly _status = signal<StoreStatus>('idle');
  private readonly _error = signal<string | null>(null);
  private _loaded = false;

  readonly products = this._products.asReadonly();
  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isLoading = computed(() => this._status() === 'loading');
  readonly hasError = computed(() => this._status() === 'error');
  readonly total = computed(() => this._products().length);

  setLoading(): void {
    this._status.set('loading');
    this._error.set(null);
  }

  setError(message: string): void {
    this._status.set('error');
    this._error.set(message);
  }

  setProducts(list: FinancialProduct[]): void {
    this._products.set(list);
    this._status.set('idle');
    this._loaded = true;
  }

  addProduct(product: FinancialProduct): void {
    this._products.update((prev) => [...prev, product]);
  }

  updateProduct(updated: FinancialProduct): void {
    this._products.update((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }

  removeProduct(id: string): void {
    this._products.update((prev) => prev.filter((p) => p.id !== id));
  }

  isLoaded(): boolean {
    return this._loaded;
  }

  loaded(): boolean {
    return this._loaded;
  }
}
