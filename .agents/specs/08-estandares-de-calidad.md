Spec 08: Quality Assurance & SOLID Patterns
Esta spec actúa como una auditoría interna para evaluar el código final.  

1. Evaluación de Principios SOLID
Single Responsibility (SRP): Verificar que los Dumb Components solo manejen UI y los Smart Components solo orquesten lógica.  

Open/Closed: Uso de interfaces para los modelos de productos financieros (FinancialProduct) que permitan extender propiedades sin romper el contrato.  

Dependency Inversion: Uso estricto de inject() para servicios y el store, facilitando el mocking en los tests.  

2. Patrones y Mejores Prácticas Angular 19
State Management: El ProductsStore manual con Signals debe centralizar todo el estado, evitando "prop drilling" excesivo.  

Control Flow: Uso de @for, @if y @empty (sintaxis moderna) para un renderizado más eficiente que *ngFor.  

OnPush Strategy: Garantizar que todos los componentes usen ChangeDetectionStrategy.OnPush para maximizar el rendimiento.