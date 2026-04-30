Spec 06: Confirmation Modal Feature (F6)1. Logic Spec (Smart Component: ProductListComponent)El listado actúa como el "Host" del modal para mantener la jerarquía de componentes standalone.  Signals de Control:productToDelete = signal<FinancialProduct | null>(null): Almacena el objeto completo para mostrar el nombre y ejecutar el ID en el delete.  showDeleteModal = computed(() => !!this.productToDelete()): Signal derivado que controla la presencia del modal en el DOM.  Manejo de Acción:Confirmar: Llama a service.deleteProduct(id), actualiza el ProductsStore localmente con removeProduct(id) (sin re-fetch) y resetea el signal a null.  Cancelar: Simplemente setea productToDelete.set(null) para cerrar el overlay.  2. Especificaciones del Dumb Component: DeleteModalComponentUn componente puro, agnóstico a la lógica de negocio, encargado solo de la presentación y la interacción del usuario.  Inputs:message: string: Texto dinámico que incluye el nombre del producto para evitar errores de eliminación accidental.  Outputs:onConfirm: EventEmitter<void>: Dispara el flujo de borrado en el padre.  onCancel: EventEmitter<void>: Notifica el cierre sin cambios.  3. Layout & UX Spec (Vanilla CSS)El diseño debe seguir el estándar D4 con un enfoque en el bloqueo de la interfaz subyacente.  CSS.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  border-radius: var(--radius-md); /* 8px-12px */
  width: 90%;
  max-width: 450px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-footer {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-top: 24px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}
4. Accesibilidad Senior (Focus Trap & Key Events)Para cumplir con el perfil Senior, el modal debe implementar:  HostListener: Escuchar el evento keydown.escape para emitir onCancel() automáticamente.  Focus Trap: Al inicializarse (ngAfterViewInit), poner el foco automáticamente en el botón "Cancelar" para evitar borrados accidentales por presionar Enter distraídamente.  Aria Roles: El contenedor debe tener role="dialog" y aria-modal="true".  5. Test Spec (Cobertura Jest ≥ 70%)Pruebas esenciales para garantizar la robustez del componente de borrado:  Caso de PruebaDescripciónInput RenderingVerificar que el mensaje proyectado incluya correctamente el nombre del producto.  Output EmissionSimular clic en "Confirmar" y verificar que el EventEmitter se dispare una sola vez.  Escape KeyDisparar evento de teclado Esc y verificar que llame a la función de cancelación.  Store Update(Integración) Verificar que tras la confirmación, el signal de productos en el store ya no contenga el ID eliminado.  