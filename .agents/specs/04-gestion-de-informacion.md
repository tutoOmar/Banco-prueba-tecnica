Spec 04: Product Form Feature 1. Logic Spec (Smart Component: ProductFormComponent)Este componente gestiona el FormGroup y la interacción con el ProductsStore.  Modo de Operación:Detecta si es Creación o Edición mediante el id en la **URL** (ActivatedRoute).  En modo edición, recupera los datos del store y deshabilita el campo ID.  Gestión de Signals:isSubmitting = signal(false): Para deshabilitar botones durante la petición.  formErrorMessage = signal<string | null>(null): Captura errores del backend (ej. **400** Bad Request).  Cálculo Automático (Senior Logic):Escucha cambios en date_release y actualiza date_revision sumando exactamente 1 año.  Ambos campos usan validadores personalizados para asegurar la integridad de las fechas.  2. Especificaciones de Componentes (Dumb)A. Universal Input ComponentComponente reutilizable que encapsula la lógica visual de error y estados.  Inputs:label: string: Nombre del campo.type: 'text' | 'date': Tipo de input.placeholder: string.isInvalid: boolean: Viene de form.get(field).invalid && touched.  errorMessage: string: Dinámico según la validación fallida.  disabled: boolean: Para el campo ID (en edición) y Fecha Revisión.  B. Action Button GroupBotón Reiniciar: Llama a form.reset().  Botón Enviar: Solo se activa si form.valid es true.  3. Layout Spec: Responsive Grid (Vanilla **CSS**)Para lograr el diseño de dos columnas solicitado, utilizaremos **CSS** Grid.  **CSS**.form-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 32px;
    border-radius: var(--radius-md);
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 2 columnas */
    gap: 24px 16px; /* Vertical / Horizontal gap */
}

/* Responsive: 1 columna en móviles */
@media (max-width: 768px) {
    .form-grid {
    grid-template-columns: 1fr;
    }
}

.field-error {
    color: var(--color-danger);
    font-size: 12px;
    margin-top: 4px;
    display: block;
}
## Validation Table (Lógica de Negocio)Cada campo debe cumplir con las reglas del documento técnico:  CampoReglas de ValidaciónMensaje de Error SugeridoIDRequerido, 3-10 chars, único (Async)*ID no válido o ya existe*  NombreRequerido, 5-100 chars*Nombre demasiado corto*  DescripciónRequerido, 10-200 chars*Descripción requerida (mín. 10)*  LogoRequerido*Este campo es requerido*  Release DateRequerido, Fecha ≥ Hoy*Fecha debe ser igual o mayor a hoy*  Revision DateRequerido, Release + 1 año*Debe ser exactamente 1 año después*  5. Test Spec (Cobertura Jest ≥ 70%)Pruebas críticas para el formulario:  Validador de ID: Verificar que el validador asíncrono llame al servicio de verificación.  Cross-Field Validation: Validar que date_revision falle si no es exactamente un año después de la liberación.  Estado del Botón: Verificar que el botón *Enviar* cambie su atributo disabled basado en la validez del formulario.  Modo Edición: Comprobar que los campos se llenen automáticamente y el ID esté deshabilitado al cargar con un parámetro de ruta.