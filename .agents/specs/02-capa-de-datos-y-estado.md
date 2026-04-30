# 02-service.spec.md
## Modelo, Signal Store (@ngrx/signals) y Servicio HTTP

**Estado:** APPROVED
**Scope:** Implementación del modelo de datos, el store centralizado con `@ngrx/signals` y el servicio HTTP que consume la API local. No incluye UI ni lógica de componentes.

---

## Contexto

Esta spec construye la capa de datos completa de la aplicación. Es el prerrequisito directo de todas las specs de pantallas (03 en adelante). Al terminar esta spec:
- El modelo `FinancialProduct` y sus tipos auxiliares están definidos.
- El `ProductsStore` gestiona estado reactivo con `@ngrx/signals`.
- El `FinancialProductsService` conecta con los 5 endpoints del backend local.
- Ambos tienen cobertura de tests ≥ 70%.

**Depende de:** `01-setup.spec.md` completada.

---

## Paso 1 — Instalar @ngrx/signals

```bash
npm install @ngrx/signals
```

> `@ngrx/signals` es independiente del resto de NgRx. No requiere instalar `@ngrx/store`, `@ngrx/effects` ni nada adicional.

Versión mínima compatible con Angular 19: `@ngrx/signals@19`.

```bash
npm install @ngrx/signals@19
```

---

## Paso 2 — Modelo de datos

Reemplazar el stub vacío en `src/app/core/models/financial-product.model.ts`:

```typescript
// core/models/financial-product.model.ts

/**
 * Entidad principal. Refleja exactamente la estructura
 * que devuelve y acepta el backend local.
 */
export interface FinancialProduct {
  id: string;           // ej: "trj-crd"
  name: string;         // ej: "Tarjetas de Crédito"
  description: string;  // ej: "Tarjeta de consumo bajo la modalidad de crédito"
  logo: string;         // URL o path de imagen
  date_release: string; // ISO "YYYY-MM-DD"
  date_revision: string;// ISO "YYYY-MM-DD" — siempre date_release + 1 año
}

/** Wrapper de la respuesta GET /bp/products */
export interface ProductsResponse {
  data: FinancialProduct[];
}

/** Wrapper de la respuesta POST y PUT */
export interface ProductMutationResponse {
  message: string;
  data: FinancialProduct;
}

/** Payload para crear un producto (el backend espera el objeto completo) */
export type CreateProductPayload = FinancialProduct;

/** Payload para editar: el id va en la URL, no en el body */
export type UpdateProductPayload = Omit<FinancialProduct, 'id'>;
```

---

## Paso 3 — Signal Store con @ngrx/signals

Reemplazar el stub en `src/app/core/store/products.store.ts`:

```typescript
// core/store/products.store.ts
import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { FinancialProduct } from '../models/financial-product.model';

export type StoreStatus = 'idle' | 'loading' | 'error';

export interface ProductsState {
  products: FinancialProduct[];
  status: StoreStatus;
  error: string | null;
  loaded: boolean;
}

const initialState: ProductsState = {
  products: [],
  status: 'idle',
  error: null,
  loaded: false,
};

export const ProductsStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ status, products }) => ({
    isLoading: computed(() => status() === 'loading'),
    hasError:  computed(() => status() === 'error'),
    total:     computed(() => products().length),
  })),

  withMethods((store) => ({

    setLoading(): void {
      patchState(store, { status: 'loading', error: null });
    },

    setError(message: string): void {
      patchState(store, { status: 'error', error: message });
    },

    setProducts(list: FinancialProduct[]): void {
      patchState(store, { products: list, status: 'idle', loaded: true });
    },

    addProduct(product: FinancialProduct): void {
      patchState(store, (state) => ({
        products: [...state.products, product],
      }));
    },

    updateProduct(updated: FinancialProduct): void {
      patchState(store, (state) => ({
        products: state.products.map((p) =>
          p.id === updated.id ? updated : p
        ),
      }));
    },

    removeProduct(id: string): void {
      patchState(store, (state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    },

  }))
);

// Re-exportar el tipo inferido para usar en componentes
export type ProductsStoreType = InstanceType<typeof ProductsStore>;
```

> **Nota sobre `patchState`:** es una función utilitaria exportada por `@ngrx/signals`. Debe importarse explícitamente:
> ```typescript
> import { patchState, signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
> ```

### Regla de uso del store

| Cuándo llamar al backend | Método del store a invocar después |
|---|---|
| Carga inicial (`loaded === false`) | `setProducts([...])` |
| POST exitoso | `addProduct(product)` |
| PUT exitoso | `updateProduct(product)` |
| DELETE exitoso | `removeProduct(id)` |
| Cualquier error HTTP | `setError(message)` |

**Nunca** hacer un GET adicional después de una mutación. El store se actualiza localmente.

---

## Paso 4 — Servicio HTTP

Reemplazar el stub en `src/app/core/services/financial-products.service.ts`:

```typescript
// core/services/financial-products.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@env/environment';
import {
  FinancialProduct,
  ProductsResponse,
  ProductMutationResponse,
  CreateProductPayload,
  UpdateProductPayload,
} from '../models/financial-product.model';

@Injectable({ providedIn: 'root' })
export class FinancialProductsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/bp/products`;

  /** GET /bp/products — devuelve el array directamente (sin wrapper) */
  getProducts(): Observable<FinancialProduct[]> {
    return this.http
      .get<ProductsResponse>(this.base)
      .pipe(
        map((res) => res.data),
        catchError(this.handleError)
      );
  }

  /** POST /bp/products */
  createProduct(payload: CreateProductPayload): Observable<ProductMutationResponse> {
    return this.http
      .post<ProductMutationResponse>(this.base, payload)
      .pipe(catchError(this.handleError));
  }

  /** PUT /bp/products/:id */
  updateProduct(
    id: string,
    payload: UpdateProductPayload
  ): Observable<ProductMutationResponse> {
    return this.http
      .put<ProductMutationResponse>(`${this.base}/${id}`, payload)
      .pipe(catchError(this.handleError));
  }

  /** DELETE /bp/products/:id */
  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.base}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * GET /bp/products/verification/:id
   * Devuelve true si el ID ya existe en el backend, false si está disponible.
   */
  verifyId(id: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.base}/verification/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const message =
      err.error?.message ?? err.message ?? 'Error desconocido del servidor';
    return throwError(() => new Error(message));
  }
}
```

---

## Paso 5 — Tests: ProductsStore

Archivo: `src/app/core/store/products.store.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { ProductsStore } from './products.store';
import { FinancialProduct } from '../models/financial-product.model';

const mockProduct = (id: string): FinancialProduct => ({
  id,
  name: `Producto ${id}`,
  description: `Descripción de ${id}`,
  logo: 'https://example.com/logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
});

describe('ProductsStore', () => {
  let store: InstanceType<typeof ProductsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ProductsStore);
  });

  describe('Estado inicial', () => {
    it('debe iniciar con products vacío', () => {
      expect(store.products()).toEqual([]);
    });

    it('debe iniciar con status idle', () => {
      expect(store.status()).toBe('idle');
    });

    it('debe iniciar con loaded en false', () => {
      expect(store.loaded()).toBe(false);
    });

    it('debe iniciar con error null', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('setLoading()', () => {
    it('debe cambiar status a loading', () => {
      store.setLoading();
      expect(store.status()).toBe('loading');
      expect(store.isLoading()).toBe(true);
    });

    it('debe limpiar el error previo', () => {
      store.setError('error previo');
      store.setLoading();
      expect(store.error()).toBeNull();
    });
  });

  describe('setError()', () => {
    it('debe cambiar status a error', () => {
      store.setError('Algo salió mal');
      expect(store.status()).toBe('error');
      expect(store.hasError()).toBe(true);
    });

    it('debe guardar el mensaje de error', () => {
      store.setError('Error de red');
      expect(store.error()).toBe('Error de red');
    });
  });

  describe('setProducts()', () => {
    it('debe guardar la lista y marcar loaded en true', () => {
      const list = [mockProduct('p1'), mockProduct('p2')];
      store.setProducts(list);
      expect(store.products()).toEqual(list);
      expect(store.loaded()).toBe(true);
      expect(store.status()).toBe('idle');
    });

    it('computed total debe reflejar la cantidad de productos', () => {
      store.setProducts([mockProduct('p1'), mockProduct('p2'), mockProduct('p3')]);
      expect(store.total()).toBe(3);
    });
  });

  describe('addProduct()', () => {
    it('debe agregar un producto al final de la lista', () => {
      store.setProducts([mockProduct('p1')]);
      store.addProduct(mockProduct('p2'));
      expect(store.products().length).toBe(2);
      expect(store.products()[1].id).toBe('p2');
    });
  });

  describe('updateProduct()', () => {
    it('debe actualizar el producto con el mismo id', () => {
      store.setProducts([mockProduct('p1')]);
      const updated = { ...mockProduct('p1'), name: 'Nombre actualizado' };
      store.updateProduct(updated);
      expect(store.products()[0].name).toBe('Nombre actualizado');
    });

    it('no debe modificar otros productos', () => {
      store.setProducts([mockProduct('p1'), mockProduct('p2')]);
      store.updateProduct({ ...mockProduct('p1'), name: 'Modificado' });
      expect(store.products()[1].name).toBe('Producto p2');
    });
  });

  describe('removeProduct()', () => {
    it('debe eliminar el producto con el id dado', () => {
      store.setProducts([mockProduct('p1'), mockProduct('p2')]);
      store.removeProduct('p1');
      expect(store.products().length).toBe(1);
      expect(store.products()[0].id).toBe('p2');
    });

    it('no debe modificar la lista si el id no existe', () => {
      store.setProducts([mockProduct('p1')]);
      store.removeProduct('no-existe');
      expect(store.products().length).toBe(1);
    });
  });

  describe('Computed signals', () => {
    it('isLoading es false cuando status es idle', () => {
      expect(store.isLoading()).toBe(false);
    });

    it('hasError es false cuando status es idle', () => {
      expect(store.hasError()).toBe(false);
    });
  });
});
```

---

## Paso 6 — Tests: FinancialProductsService

Archivo: `src/app/core/services/financial-products.service.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { FinancialProductsService } from './financial-products.service';
import { FinancialProduct } from '../models/financial-product.model';
import { environment } from '@env/environment';

const BASE = `${environment.apiBaseUrl}/bp/products`;

const mockProduct: FinancialProduct = {
  id: 'trj-crd',
  name: 'Tarjetas de Crédito',
  description: 'Tarjeta de consumo bajo la modalidad de crédito',
  logo: 'https://example.com/logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
};

describe('FinancialProductsService', () => {
  let service: FinancialProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(FinancialProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getProducts ──────────────────────────────────────────────
  describe('getProducts()', () => {
    it('debe retornar el array de productos en respuesta 200', (done) => {
      service.getProducts().subscribe((products) => {
        expect(products).toEqual([mockProduct]);
        done();
      });
      httpMock
        .expectOne(BASE)
        .flush({ data: [mockProduct] });
    });

    it('debe lanzar error legible en fallo de red', (done) => {
      service.getProducts().subscribe({
        error: (err: Error) => {
          expect(err.message).toBeTruthy();
          done();
        },
      });
      httpMock.expectOne(BASE).error(new ProgressEvent('error'));
    });
  });

  // ── createProduct ────────────────────────────────────────────
  describe('createProduct()', () => {
    it('debe retornar el producto creado en respuesta 200', (done) => {
      service.createProduct(mockProduct).subscribe((res) => {
        expect(res.data).toEqual(mockProduct);
        expect(res.message).toBe('Product added successfully');
        done();
      });
      httpMock.expectOne(BASE).flush({
        message: 'Product added successfully',
        data: mockProduct,
      });
    });

    it('debe lanzar error con mensaje del backend en respuesta 400', (done) => {
      service.createProduct(mockProduct).subscribe({
        error: (err: Error) => {
          expect(err.message).toContain('Invalid body');
          done();
        },
      });
      httpMock.expectOne(BASE).flush(
        { message: 'Invalid body, check errors property for more info.' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  // ── updateProduct ────────────────────────────────────────────
  describe('updateProduct()', () => {
    const { id, ...payload } = mockProduct;

    it('debe retornar el producto actualizado en respuesta 200', (done) => {
      service.updateProduct(id, payload).subscribe((res) => {
        expect(res.message).toBe('Product updated successfully');
        done();
      });
      httpMock.expectOne(`${BASE}/${id}`).flush({
        message: 'Product updated successfully',
        data: mockProduct,
      });
    });

    it('debe lanzar error en respuesta 404', (done) => {
      service.updateProduct(id, payload).subscribe({
        error: (err: Error) => {
          expect(err.message).toContain('Not product found');
          done();
        },
      });
      httpMock.expectOne(`${BASE}/${id}`).flush(
        { message: 'Not product found with that identifier' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  // ── deleteProduct ────────────────────────────────────────────
  describe('deleteProduct()', () => {
    it('debe retornar mensaje de éxito en respuesta 200', (done) => {
      service.deleteProduct('trj-crd').subscribe((res) => {
        expect(res.message).toBe('Product removed successfully');
        done();
      });
      httpMock
        .expectOne(`${BASE}/trj-crd`)
        .flush({ message: 'Product removed successfully' });
    });

    it('debe lanzar error en respuesta 404', (done) => {
      service.deleteProduct('no-existe').subscribe({
        error: (err: Error) => {
          expect(err.message).toContain('Not product found');
          done();
        },
      });
      httpMock.expectOne(`${BASE}/no-existe`).flush(
        { message: 'Not product found with that identifier' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  // ── verifyId ─────────────────────────────────────────────────
  describe('verifyId()', () => {
    it('debe retornar true si el id ya existe', (done) => {
      service.verifyId('trj-crd').subscribe((exists) => {
        expect(exists).toBe(true);
        done();
      });
      httpMock
        .expectOne(`${BASE}/verification/trj-crd`)
        .flush(true);
    });

    it('debe retornar false si el id no existe', (done) => {
      service.verifyId('nuevo-id').subscribe((exists) => {
        expect(exists).toBe(false);
        done();
      });
      httpMock
        .expectOne(`${BASE}/verification/nuevo-id`)
        .flush(false);
    });
  });
});
```

---

## Criterios de aceptación

| # | Criterio | Cómo verificar |
|---|---|---|
| 1 | `@ngrx/signals` instalado sin conflictos | `npm ls @ngrx/signals` muestra versión 19.x |
| 2 | `FinancialProduct` y tipos auxiliares exportados correctamente | `ng build` sin errores de tipo |
| 3 | `ProductsStore` provisto en root con `signalStore` | `TestBed.inject(ProductsStore)` no lanza error |
| 4 | Todos los métodos del store modifican el estado correctamente | `npm test -- --testPathPattern=products.store` pasa en verde |
| 5 | `FinancialProductsService` mapea los 5 endpoints correctamente | `npm test -- --testPathPattern=financial-products.service` pasa en verde |
| 6 | Los errores HTTP se transforman en `Error` con mensaje legible | Tests de error path pasan en verde |
| 7 | El service no tiene estado propio (sin signals, sin BehaviorSubject) | Revisión de código: solo métodos que retornan `Observable` |
| 8 | Cobertura del store y service ≥ 70% | `npm run test:coverage` — sección `core/` supera el umbral |

---

## Lo que esta spec NO cubre

- UI de ningún componente (→ specs 03 a 06).
- Validators de formulario (→ `06-shared.spec.md`).
- Lógica de búsqueda y paginación (→ `03-product-list.spec.md`).
- Toast store (→ `06-shared.spec.md`).
- Integración del store con los componentes (→ cada spec de feature).