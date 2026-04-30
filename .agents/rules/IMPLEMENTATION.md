---
trigger: always_on
---


## 12. Testing (Jest — cobertura ≥ 70%)

### Configuración Jest

```json
// jest.config.ts
{
  "preset": "jest-preset-angular",
  "setupFilesAfterFramework": ["<rootDir>/setup-jest.ts"],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

### Qué testear por archivo

| Archivo | Tests mínimos obligatorios |
|---|---|
| `products.store.spec.ts` | setProducts, addProduct, updateProduct, removeProduct, isLoaded, signals computed |
| `financial-products.service.spec.ts` | getProducts (200 / error), createProduct (200 / 400), updateProduct (200 / 404), deleteProduct (200 / 404), verifyId (true / false) |
| `product-list.component.spec.ts` | renderiza skeleton en loading, renderiza productos, búsqueda filtra resultados, cambio de pageSize, abre modal de eliminación, navega a agregar |
| `product-form.component.spec.ts` | modo create vs edit, validaciones por campo, error visual en campo inválido, auto-cálculo date_revision, submit exitoso, reiniciar |
| `delete-modal.component.spec.ts` | emite confirm, emite cancel, muestra nombre del producto |
| `date-release.validator.spec.ts` | fecha pasada → inválido, fecha hoy → válido, fecha futura → válido |
| `date-revision.validator.spec.ts` | exactamente +1 año → válido, diferente → inválido, sin date_release → inválido |

### Patrón de test por componente

Cada nuevo componente o servicio que se genere **debe incluir su `.spec.ts`** en el mismo directorio, siguiendo este patrón:

```typescript
describe('NombreComponent', () => {
  // 1. Setup mínimo con TestBed
  // 2. Un bloque describe por método / comportamiento
  // 3. Casos happy path + error path
  // 4. No usar `any` en los mocks
});
```

---

## 13. Performance (Deseable Senior)

- `ChangeDetectionStrategy.OnPush` en **todos** los componentes.
- `trackBy` en todos los `*ngFor` / `@for`.
- Lazy loading de rutas (ya definido en sección 7).
- Signals evitan detecciones innecesarias de cambio.
- El store no re-fetch si `isLoaded() === true` y no hubo mutación.

---

## 14. Flujo de Datos (Diagrama simplificado)

```
App Bootstrap
     │
     ▼
ProductListComponent.ngOnInit()
     │  store.isLoaded() === false?
     ▼
FinancialProductsService.getProducts()  ──► GET /bp/products
     │
     ▼
ProductsStore.setProducts([...])
     │
     ▼
computed(filteredProducts) ──► computed(paginatedProducts)
     │
     ▼
Template renderiza filas

Acción del usuario (crear / editar / eliminar)
     │
     ▼
Service llama al endpoint correspondiente
     │  éxito
     ▼
Store.addProduct() | Store.updateProduct() | Store.removeProduct()
     │  (sin GET adicional)
     ▼
Signal dispara re-render automático vía computed()
```

---

## 15. Checklist de Entrega

- [ ] Angular 19, standalone components, signals
- [ ] CSS vanilla, sin frameworks de UI
- [ ] Rutas lazy-loaded
- [ ] Store con signals (sin petición si ya cargado)
- [ ] F1 — Listado de productos
- [ ] F2 — Búsqueda en tiempo real
- [ ] F3 — Contador de resultados + selector de cantidad (5/10/20)
- [ ] F4 — Formulario agregar con validaciones
- [ ] F5 — Editar producto (ID deshabilitado, mismas validaciones)
- [ ] F6 — Eliminar con modal de confirmación
- [ ] Skeleton preloader
- [ ] Responsive design
- [ ] Toast de error/éxito
- [ ] Cobertura Jest ≥ 70% (branches, functions, lines, statements)
- [ ] `.spec.ts` por cada componente, servicio, validator y store
- [ ] `environment.ts` con `apiBaseUrl: 'http://localhost:3002'`
- [ ] Repositorio Git público con README de instalación