Spec 03 Product List Feature 1. Logic Spec (Smart Component)El ProductListComponent actuará como el orquestador utilizando el ProductsStore.  Signals de Estado:searchTerm = signal(''): Actualizado por el componente de búsqueda con el debounce aplicado.pageSize = signal<5 | 10 | 20>(5): Vinculado al selector de paginación.  Computed Signals (Eficiencia Senior):filteredProducts: Derivado de store.products() y searchTerm(). Realiza la búsqueda sobre name y description.  paginatedProducts: Derivado de filteredProducts() aplicando un .slice(0, pageSize()).  totalResults: filteredProducts().length.  Lifecycle:ngOnInit: Dispara service.getProducts() solo si store.isLoaded() es falso.  2. Especificaciones de Componentes (Dumb)A. Search Input (Debounce Logic)Implementación: Usar un FormControl local o un Subject.Operador: valueChanges.pipe(debounceTime(400), distinctUntilChanged()).Output: Emite el string al componente padre para setear el signal searchTerm.B. Data TableEstructura HTML: <table> nativa con border-collapse: collapse.Columna Logo: Contenedor circular 40px con object-fit: cover para evitar deformación de imágenes.  Directiva @for: Usar la sintaxis de Angular 19 con track product.id para optimizar el DOM.  Tooltips (Icono i): Texto descriptivo simple al hacer hover sobre los encabezados de Fecha y Descripción.  C. Pagination SelectorSelect Nativo: Sin librerías. Estilo con appearance: none o CSS vanilla para que coincida con el look del banco.Event: Al cambiar, dispara pageSize.set(newValue).3. Estilos Sugeridos (CSS Variables)Para cumplir con el Layout F1, el contenedor principal debe usar:CSS.main-container {
  background-color: var(--color-bg); /* Gris claro */
  padding: 40px 10%;
  min-height: 100vh;
}

.table-card {
  background: white;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-card);
  padding: 20px;
}

.header-table {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
4. Test Spec (Cobertura Jest ≥ 70%)Para asegurar la calificación de Senior, los tests deben cubrir:Caso de PruebaDescripciónInitial LoadVerificar que se muestra el SkeletonRow mientras store.isLoading es true.  Search FilterSimular input de búsqueda y verificar que paginatedProducts se reduzca correctamente.Page Size ChangeCambiar el select a "10" y verificar que la tabla intente mostrar hasta 10 registros.  Empty StateMostrar un mensaje amigable si totalResults === 0.Error HandlingVerificar que si el servicio falla, se dispare el signal de error y se muestre un mensaje visual.  