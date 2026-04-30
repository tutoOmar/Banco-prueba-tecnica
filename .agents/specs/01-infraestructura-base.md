# Especificación 01: Infraestructura Base
## Configuración del Workspace y Entorno de Desarrollo

**Estado:** APPROVED
**Scope:** Scaffolding del proyecto Angular 19, configuración de Jest, environments, rutas y archivos base. No incluye lógica de negocio ni componentes de feature.

---

## Contexto

El proyecto está vacío. Esta spec cubre todo lo necesario para tener un workspace funcional, compilable y con tests corriendo antes de escribir una sola línea de lógica. Cualquier IA o desarrollador que ejecute esta spec debe terminar con un proyecto que:
- Compila sin errores (`ng build`).
- Pasa `jest --coverage` con 0 tests (sin fallar por configuración).
- Tiene la estructura de carpetas completa (archivos vacíos o con barrel exports).
- Las rutas están declaradas y el lazy loading resuelve sin errores en runtime.

---

## Pre-requisitos del entorno

| Herramienta | Versión requerida |
|---|---|
| Node.js | 20 LTS |
| npm | 10+ |
| Angular CLI | 19.x (`npm i -g @angular/cli@19`) |

---

## Paso 1 — Crear el proyecto Angular

```bash
ng new bp-financial-products \
  --routing=true \
  --style=css \
  --standalone \
  --skip-tests \
  --no-ssr
```

Flags importantes:
- `--standalone`: todos los componentes serán standalone desde el inicio.
- `--skip-tests`: omitir los `.spec.ts` de Karma que genera el CLI (usaremos Jest).
- `--no-ssr`: no se requiere Server Side Rendering.

Tras la creación, entrar al directorio:
```bash
cd bp-financial-products
```

---

## Paso 2 — Eliminar Karma y configurar Jest

### 2.1 Desinstalar Karma
```bash
npm uninstall @angular/platform-browser-dynamic karma karma-chrome-launcher \
  karma-coverage karma-jasmine karma-jasmine-html-reporter
```

### 2.2 Instalar Jest
```bash
npm install --save-dev \
  jest@29 \
  jest-preset-angular@14 \
  @types/jest@29 \
  ts-jest@29
```

### 2.3 Crear `jest.config.ts` en la raíz del proyecto

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },
  moduleNameMapper: {
    '^@env/(.*)$': '<rootDir>/src/environments/$1',
  },
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
```

> **Nota:** `setupFilesAfterFramework` es el key correcto para `jest-preset-angular`. No confundir con `setupFilesAfterFramework` de Jest puro.

### 2.4 Crear `setup-jest.ts` en la raíz

```typescript
// setup-jest.ts
import 'jest-preset-angular/setup-jest';
```

### 2.5 Crear `tsconfig.spec.json` en la raíz

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["jest"]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts",
    "setup-jest.ts"
  ]
}
```

### 2.6 Actualizar `tsconfig.json` — asegurar paths y strict mode

En el `compilerOptions` existente, verificar / agregar:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "paths": {
      "@env/*": ["./src/environments/*"]
    }
  }
}
```

### 2.7 Agregar scripts en `package.json`

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --ci --coverage --forceExit"
}
```

---

## Paso 3 — Environments

Crear los dos archivos de entorno. Si ya existen, reemplazar su contenido.

```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:3002'
};
```

```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3002'
};
```

Registrar el fileReplacement en `angular.json`, dentro de `projects > bp-financial-products > architect > build > configurations > development`:
```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.development.ts"
  }
]
```

---

## Paso 4 — CSS global con variables

Reemplazar el contenido de `src/styles.css`:

```css
/* src/styles.css */
:root {
  --color-primary:  #FFDD00;
  --color-danger:   #E74C3C;
  --color-success:  #27AE60;
  --color-text:     #1A1A2E;
  --color-border:   #CBD5E0;
  --color-bg:       #F7F8FA;
  --radius-sm:      4px;
  --radius-md:      8px;
  --shadow-card:    0 2px 8px rgba(0, 0, 0, 0.08);
  --font-base:      'Segoe UI', Arial, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-base);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.5;
}

/* Skeleton pulse animation — usada por SkeletonRowComponent */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
```

---

## Paso 5 — Estructura de carpetas

Crear todos los directorios y archivos vacíos. El objetivo es que la estructura exista aunque los archivos no tengan implementación aún.

```
src/app/
├── core/
│   ├── models/
│   │   └── financial-product.model.ts       ← solo exportar interfaces vacías (ver abajo)
│   ├── services/
│   │   ├── financial-products.service.ts    ← clase vacía con @Injectable
│   │   └── financial-products.service.spec.ts
│   └── store/
│       ├── products.store.ts                ← clase vacía con @Injectable
│       └── products.store.spec.ts
├── features/
│   ├── product-list/
│   │   ├── product-list.component.ts
│   │   ├── product-list.component.html      ← <p>product-list works</p>
│   │   ├── product-list.component.css
│   │   └── product-list.component.spec.ts
│   ├── product-form/
│   │   ├── product-form.component.ts
│   │   ├── product-form.component.html      ← <p>product-form works</p>
│   │   ├── product-form.component.css
│   │   └── product-form.component.spec.ts
│   └── delete-modal/
│       ├── delete-modal.component.ts
│       ├── delete-modal.component.html      ← <p>delete-modal works</p>
│       ├── delete-modal.component.css
│       └── delete-modal.component.spec.ts
└── shared/
    ├── components/
    │   ├── skeleton-row/
    │   │   ├── skeleton-row.component.ts
    │   │   ├── skeleton-row.component.html
    │   │   ├── skeleton-row.component.css
    │   │   └── skeleton-row.component.spec.ts
    │   └── toast/
    │       ├── toast.component.ts
    │       ├── toast.component.html
    │       ├── toast.component.css
    │       └── toast.component.spec.ts
    └── validators/
        ├── date-release.validator.ts
        ├── date-release.validator.spec.ts
        ├── date-revision.validator.ts
        └── date-revision.validator.spec.ts
```

### Contenido mínimo para archivos de componente (evitar errores de compilación)

Usar este patrón para cada componente de feature y shared:

```typescript
// Ejemplo: product-list.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {}
```

> Aplicar el mismo patrón a `ProductFormComponent`, `DeleteModalComponent`, `SkeletonRowComponent`, `ToastComponent`, cambiando selector y nombre de clase.

### Contenido mínimo para el modelo

```typescript
// core/models/financial-product.model.ts
export interface FinancialProduct {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface ProductsResponse {
  data: FinancialProduct[];
}

export interface ProductMutationResponse {
  message: string;
  data: FinancialProduct;
}
```

### Contenido mínimo para el store y el service

```typescript
// core/store/products.store.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProductsStore {}
```

```typescript
// core/services/financial-products.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FinancialProductsService {}
```

---

## Paso 6 — Rutas

Reemplazar `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/product-list/product-list.component').then(
        (m) => m.ProductListComponent
      ),
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./features/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      ),
  },
  {
    path: 'products/edit/:id',
    loadComponent: () =>
      import('./features/product-form/product-form.component').then(
        (m) => m.ProductFormComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
```

---

## Paso 7 — AppComponent

Reemplazar `src/app/app.component.ts` para que solo provea el `router-outlet`:

```typescript
// app.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
```

```html
<!-- app.component.html -->
<router-outlet />
```

---

## Paso 8 — main.ts

Verificar que `main.ts` use `bootstrapApplication` con `provideRouter` y `provideHttpClient`:

```typescript
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ],
}).catch(console.error);
```

---

## Criterios de aceptación

| # | Criterio | Cómo verificar |
|---|---|---|
| 1 | El proyecto compila sin errores ni warnings | `ng build` termina con código 0 |
| 2 | Jest está configurado y corre sin fallar | `npm test` sin errores de configuración |
| 3 | Todos los archivos de la estructura existen | Revisar árbol con `find src/app -type f` |
| 4 | Las rutas lazy resuelven en el browser | `ng serve`, navegar a `/products` no lanza error de módulo |
| 5 | `styles.css` tiene las variables CSS definidas | Inspeccionar `:root` en DevTools |
| 6 | `environment.ts` tiene `apiBaseUrl` correcto | Revisar archivo manualmente |
| 7 | `tsconfig.json` tiene `strict: true` activo | `ng build` no pasa con `any` implícito |
| 8 | `HttpClient` está provisto en `main.ts` | No lanza `NullInjectorError` al inyectar en services |

---

## Lo que esta spec NO cubre

- Implementación del `ProductsStore` (→ `02-service.spec.md`).
- Implementación del `FinancialProductsService` (→ `02-service.spec.md`).
- UI y lógica de los componentes de feature (→ specs 03 a 06).
- Validators personalizados (→ spec 06).
- Tests unitarios de componentes (→ sus specs respectivas).