import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductsStore } from '../../core/store/products.store';
import { FinancialProductsService } from '../../core/services/financial-products.service';
import { SkeletonRowComponent } from '../../shared/components/skeleton-row/skeleton-row.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SkeletonRowComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private readonly store = inject(ProductsStore);
  private readonly service = inject(FinancialProductsService);

  readonly products = this.store.products;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  imageErrors = signal<Record<string, boolean>>({});

  searchTerm = signal('');
  pageSize = signal<number>(5);

  searchControl = new FormControl('');

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.products().filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term)
    );
  });

  paginatedProducts = computed(() => {
    return this.filteredProducts().slice(0, this.pageSize());
  });

  totalResults = computed(() => this.filteredProducts().length);

  ngOnInit(): void {
    if (!this.store.isLoaded()) {
      this.loadProducts();
    }

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchTerm.set(value || '');
    });
  }

  loadProducts(): void {
    this.store.setLoading();
    this.service.getProducts().subscribe({
      next: (products) => this.store.setProducts(products),
      error: (err) => this.store.setError(err.message)
    });
  }

  onPageSizeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.pageSize.set(Number(value));
  }

  onImageError(id: string): void {
    this.imageErrors.update(prev => ({ ...prev, [id]: true }));
  }
}
