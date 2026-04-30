Spec 09: Documentación y Guía de Operación (README)
Este será el archivo README.md que defenderá tu solución ante los evaluadores.  

1. Resumen del Proyecto
Propósito: Dashboard para la gestión de productos financieros (CRUD) con validaciones estrictas y arquitectura escalable.  

Stack: Angular 19, Signals API, Jest, Vanilla CSS.  

2. Guía de Inicio Rápido
Requisitos: Node.js v20+, Backend local corriendo en el puerto 3002.  

Instalación: npm install.

Ejecución: npm start.

3. Troubleshooting (CORS & Errores)
CORS: Nota crítica indicando que, dado que los servicios son locales, el backend debe tener habilitado el acceso desde http://localhost:4200. Si falla la carga, verificar la configuración de cors en el archivo index.js o app.js del backend suministrado.  

API Base: Confirmar que environment.ts apunta a http://localhost:3002/bp/products.  

4. Calidad y Cobertura
Verificación de Tests: Explicar que se usa npm run test:coverage.

Evidencia: Mencionar que la cobertura se verifica en la carpeta /coverage/lcov-report/index.html tras ejecutar los tests.