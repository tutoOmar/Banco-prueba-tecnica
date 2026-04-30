---
trigger: always_on
---

# architecture.spec.md
## Prueba Técnica Frontend — Angular 19 (Senior)

---

## 1. Stack & Versiones

| Herramienta | Versión mínima |
|---|---|
| Angular | 19.x (standalone components, signals API) |
| TypeScript | 5.4+ |
| Node.js | 20 LTS |
| Jest | 29.x |
| @angular/core signals | API nativa (no NgRx, no RxJS stores) |
| CSS | Vanilla CSS (sin frameworks, sin librerías de componentes) |

---

## 2. Estructura de Carpetas

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── financial-product.model.ts
│   │   ├── services/
│   │   │   └── financial-products.service.ts
│   │   │   └── financial-products.service.spec.ts
│   │   └── store/
│   │       └── products.store.ts          ← Signal store centralizado
│   │       └── products.store.spec.ts
│   ├── features/
│   │   ├── product-list/
│   │   │   ├── product-list.component.ts
│   │   │   ├── product-list.component.html
│   │   │   ├── product-list.component.css
│   │   │   └── product-list.component.spec.ts
│   │   ├── product-form/
│   │   │   ├── product-form.component.ts
│   │   │   ├── product-form.component.html
│   │   │   ├── product-form.component.css
│   │   │   └── product-form.component.spec.ts
│   │   └── delete-modal/
│   │       ├── delete-modal.component.ts
│   │       ├── delete-modal.component.html
│   │       ├── delete-modal.component.css
│   │       └── delete-modal.component.spec.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── skeleton-row/
│   │   │   │   ├── skeleton-row.component.ts
│   │   │   │   ├── skeleton-row.component.html
│   │   │   │   ├── skeleton-row.component.css
│   │   │   │   └── skeleton-row.component.spec.ts
│   │   │   └── toast/
│   │   │       ├── toast.component.ts
│   │   │       ├── toast.component.html
│   │   │       ├── toast.component.css
│   │   │       └── toast.component.spec.ts
│   │   └── validators/
│   │       ├── date-release.validator.ts
│   │       ├── date-release.validator.spec.ts
│   │       ├── date-revision.validator.ts
│   │       └── date-revision.validator.spec.ts
│   ├── app.component.ts
│   ├── app.component.html
│   ├── app.component.css
│   ├── app.component.spec.ts
│   └── app.routes.ts
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
├── styles.css
└── main.ts
```

---

## 3. Modelo de Datos

```typescript
// core/models/financial-product.model.ts

export interface FinancialProduct {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;   // ISO: "YYYY-MM-DD"
  date_revision: string;  // ISO: "YYYY-MM-DD"
}

export interface ProductsResponse {
  data: FinancialProduct[];
}

export interface ProductMutationResponse {
  message: string;
  data: FinancialProduct;
}
```

---

## 4. Entorno (Environments)

```typescript
// environments/environment.ts
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:3002'
};

// environments/environment.development.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3002'
};
```

---

## 5. Signal Store Centralizado

El store es el **único punto de verdad**. El service HTTP se llama únicamente cuando:
- Se monta la app por primera vez (carga inicial).
- Se crea un nuevo producto (POST).
- Se edita un producto (PUT).
- Se elimina un producto (DELETE).

```typescript
// core/store/products.store.ts

import { Injectable, signal, computed } from '@angular/core';
import { FinancialProduct } from '../models/financial-product.model';

export type StoreStatus = 'idle' | 'loading' | 'error';

@Injectable({ providedIn: 'root' })
export class ProductsStore {
  // --- State signals (privados, mutación solo interna) ---
  private readonly _products = signal<FinancialProduct[]>([]);
  private readonly _status   = signal<StoreStatus>('idle');
  private readonly _error    = signal<string | null>(null);
  private _loaded            = false;

  // --- Public readonly signals ---
  readonly products = this._products.asReadonly();
  readonly status   = this._status.asReadonly();
  readonly error    = this._error.asReadonly();

  // --- Computed ---
  readonly isLoading = computed(() => this._status() === 'loading');
  readonly hasError  = computed(() => this._status() === 'error');

  // --- Métodos de mutación ---
  setLoading()                              { this._status.set('loading'); this._error.set(null); }
  setError(msg: string)                     { this._status.set('error'); this._error.set(msg); }
  setProducts(list: FinancialProduct[])     { this._products.set(list); this._status.set('idle'); this._loaded = true; }
  addProduct(p: FinancialProduct)           { this._products.update(prev => [...prev, p]); }
  updateProduct(p: FinancialProduct)        { this._products.update(prev => prev.map(x => x.id === p.id ? p : x)); }
  removeProduct(id: string)                 { this._products.update(prev => prev.filter(x => x.id !== id)); }
  isLoaded()                                { return this._loaded; }
}
```

**Regla clave:** el `ProductsService` invoca `store.setProducts()` solo si `!store.isLoaded()`. Después de cualquier mutación exitosa, actualiza el store localmente sin hacer un GET adicional.

---

## 6. Servicio HTTP

```typescript
// core/services/financial-products.service.ts

// Métodos expuestos:
getProducts(): Observable<FinancialProduct[]>
createProduct(body: Omit<FinancialProduct, never>): Observable<ProductMutationResponse>
updateProduct(id: string, body: Omit<FinancialProduct, 'id'>): Observable<ProductMutationResponse>
deleteProduct(id: string): Observable<{ message: string }>
verifyId(id: string): Observable<boolean>
```

Endpoints mapeados del backend local:

| Método | URL | Acción |
|---|---|---|
| GET | `/bp/products` | Obtener todos |
| POST | `/bp/products` | Crear |
| PUT | `/bp/products/:id` | Actualizar |
| DELETE | `/bp/products/:id` | Eliminar |
| GET | `/bp/products/verification/:id` | Verificar si el ID ya existe |

- Usa `HttpClient` con `inject()` (no constructor injection).
- Maneja errores con `catchError` y re-lanza un mensaje legible.
- No tiene estado propio: toda la persistencia en memoria vive en el `ProductsStore`.

---

## 7. Rutas

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'products',
    loadComponent: () => import('./features/product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'products/new',
    loadComponent: () => import('./features/product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./features/product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },
  { path: '**', redirectTo: 'products' }
];
```

- Todos los componentes son **standalone**.
- Lazy loading en todas las rutas de feature.

---

## 8. Componentes

### 8.1 ProductListComponent (F1, F2, F3, F5, F6)

**Responsabilidades:**
- Lee `ProductsStore.products` vía signal (sin subscribe).
- Dispara carga inicial si `!store.isLoaded()`.
- Búsqueda local via `computed()` derivado del signal de búsqueda.
- Paginación local: signal `pageSize` (5 | 10 | 20), signal `currentPage`.
- Muestra `SkeletonRowComponent` mientras `store.isLoading()`.
- Dropdown contextual por fila (editar / eliminar).
- Abre `DeleteModalComponent` al elegir eliminar.

**Signals internos:**
```typescript
searchTerm  = signal('');
pageSize    = signal<5 | 10 | 20>(5);

filteredProducts = computed(() =>
  this.store.products().filter(p =>
    p.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
    p.description.toLowerCase().includes(this.searchTerm().toLowerCase())
  )
);

paginatedProducts = computed(() =>
  this.filteredProducts().slice(0, this.pageSize())
);
```

**Diseño referencia:** D1 y D3.

---

### 8.2 ProductFormComponent (F4, F5)

**Responsabilidades:**
- Modo `create` o `edit` según la ruta activa (`ActivatedRoute`).
- En modo `edit`: pre-carga el producto del store (sin petición extra), deshabilita el campo `id`.
- Reactive Form con `FormBuilder` y validadores síncronos + asíncrono (verificación de ID).
- Botón "Reiniciar" limpia todos los campos al estado inicial.
- Botón "Enviar" / "Guardar" deshabilitado si el form es inválido.
- Al éxito: actualiza el store y navega de vuelta a `/products`.

**Validaciones:**

| Campo | Validación |
|---|---|
| id | required, minLength(3), maxLength(10), asyncValidator: verifyId (no debe existir) |
| name | required, minLength(5), maxLength(100) |
| description | required, minLength(10), maxLength(200) |
| logo | required |
| date_release | required, fecha >= hoy (validator custom) |
| date_revision | required, exactamente 1 año después de date_release (validator custom) |

**Auto-cálculo:** cuando `date_release` cambia, `date_revision` se recalcula y se pone automáticamente como `date_release + 1 año` (readonly en modo auto-fill, sin quitar la validación).

**Diseño referencia:** D2.

---

### 8.3 DeleteModalComponent (F6)

**Responsabilidades:**
- Recibe el producto a eliminar vía `@Input()`.
- Emite `confirm` y `cancel` via `@Output()`.
- El padre (`ProductListComponent`) se suscribe: en `confirm` llama al service, actualiza el store, cierra el modal.

**Diseño referencia:** D4.

---

### 8.4 SkeletonRowComponent (Deseable Senior)

- Renderiza filas fantasma con animación CSS pulse.
- Recibe `@Input() rows = 5`.
- Se muestra cuando `store.isLoading() === true`.

---

### 8.5 ToastComponent

- Notificaciones de éxito / error flotantes.
- Signal global en un `ToastStore` separado (mismo patrón).
- Auto-desaparece a los 3 segundos.

---

## 9. Validadores Personalizados

```typescript
// shared/validators/date-release.validator.ts
// Valida que la fecha sea >= fecha actual (sin hora)
export function dateReleaseValidator(): ValidatorFn

// shared/validators/date-revision.validator.ts
// Valida que date_revision === date_release + 1 año exacto
// Es un cross-field validator que opera sobre el FormGroup
export function dateRevisionValidator(): ValidatorFn
```

---

## 10. Manejo de Errores

- Errores HTTP se capturan en el service y se propagan como strings legibles.
- El store tiene `_error` signal; los componentes leen `store.error()` y muestran el `ToastComponent`.
- Campos de formulario inválidos muestran un `<span class="field-error">` con borde rojo en el input (sin librerías externas).
- En respuestas 400/404/500 del backend se muestra el mensaje del campo `message` de la respuesta.

---

## 11. CSS (Vanilla)

- **No Bootstrap, no Tailwind, no Angular Material.**
- Un archivo `styles.css` global con variables CSS:

```css
:root {
  --color-primary:    #FFDD00;   /* amarillo banco */
  --color-danger:     #E74C3C;
  --color-success:    #27AE60;
  --color-text:       #1A1A2E;
  --color-border:     #CBD5E0;
  --color-bg:         #F7F8FA;
  --radius-sm:        4px;
  --radius-md:        8px;
  --shadow-card:      0 2px 8px rgba(0,0,0,.08);
  --font-base:        'Segoe UI', Arial, sans-serif;
}
```

- Cada componente tiene su propio `.css` con estilos encapsulados (`ViewEncapsulation.Emulated` por defecto).
- Responsive: breakpoints manuales vía `@media (max-width: 768px)`.
- Skeleton animation: `@keyframes pulse` en CSS puro.

---


No colocar comentarios en ningun lado, el mismo codigo deberia ser suficiente para ser entendido