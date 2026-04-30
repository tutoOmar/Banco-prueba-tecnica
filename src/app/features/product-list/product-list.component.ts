import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';
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
  private readonly router = inject(Router);

  readonly products = this.store.products;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;

  imageErrors = signal<Record<string, boolean>>({});

  searchTerm = signal('');
  pageSize = signal<number>(5);
  activeMenuId = signal<string | null>(null);

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

  onAddProduct(): void {
    this.router.navigate(['/products/new']);
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.activeMenuId.update(current => current === id ? null : id);
  }

  onEdit(id: string): void {
    this.router.navigate(['/products/edit', id]);
    this.activeMenuId.set(null);
  }

  onDelete(product: any): void {
    // F6 will handle this
    this.activeMenuId.set(null);
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.activeMenuId.set(null);
  }
}
