# BP Financial Products Dashboard

Este proyecto es una aplicación frontend desarrollada con **Angular 19** para la gestión de productos financieros (CRUD), siguiendo los más altos estándares de arquitectura y calidad de software.

## 1. Stack Tecnológico
- **Core**: Angular 19 (Standalone Components, Signals API, Control Flow).
- **State Management**: Signals-based centralized store (ProductsStore).
- **Testing**: Jest con cobertura de código >70%.
- **Estilos**: Vanilla CSS (sin frameworks externos, mobile-first).
- **Contenedores**: Docker (Multi-stage build).
- **CI/CD**: GitHub Actions.

## 2. Guía de Inicio Rápido

### Requisitos Previos
- **Node.js**: v20 o superior.
- **Backend Local**: Debe estar corriendo en `http://localhost:3002`.

### Instalación
```bash
npm install
```

### Ejecución en Desarrollo
```bash
npm start
```
La aplicación estará disponible en `http://localhost:4200`.

### Ejecución con Docker
```bash
docker build -t banco-pichincha-frontend .
docker run -p 8080:80 banco-pichincha-frontend
```

## 3. Pruebas y Calidad
Para ejecutar la suite de pruebas unitarias y verificar la cobertura:
```bash
npm run test:coverage
```
Los reportes detallados se generan en la carpeta `/coverage`.

## 4. Arquitectura de la Solución
- **Smart/Dumb Components**: Separación clara entre componentes de lógica y componentes de presentación.
- **OnPush Strategy**: Optimización de rendimiento en todos los componentes.
- **Validators**: Validaciones personalizadas síncronas y asíncronas (ID único).
- **Servicios**: Implementación del patrón Port/Adapter mediante inyección de dependencias con `inject()`.

## 5. Troubleshooting (CORS)
Dado que los servicios son locales, si experimenta errores de conexión, asegúrese de que el backend tenga habilitado **CORS** para `http://localhost:4200`. La URL base de la API se configura en `src/environments/environment.ts`.

---
Desarrollado como solución técnica de gestión financiera.
