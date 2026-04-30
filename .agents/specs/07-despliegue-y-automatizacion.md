Spec 07: CI/CD Pipeline & Containerization
1. Dockerization (Dockerfile & .dockerignore)
El objetivo es crear una imagen ligera y productiva para el frontend.  

Multi-stage Build:

Etapa 1 (Build): Usar node:20-alpine para compilar la aplicación.

Etapa 2 (Serve): Usar nginx:stable-alpine para servir los archivos estáticos.  

Configuración Nginx: Se debe incluir un archivo nginx.conf personalizado para manejar el enrutamiento de Angular (SPAs) y evitar errores 404 al recargar rutas internas.  

.dockerignore: Excluir node_modules, dist, .git y archivos de testing para mantener la imagen limpia.

2. CI Pipeline (GitHub Actions o GitLab CI)
Un flujo automatizado que garantice que nadie suba código roto.  

Jobs obligatorios:

Lint & Format: Ejecutar npm run lint para asegurar el cumplimiento de reglas de estilo.

Unit Tests: Ejecutar npm run test -- --coverage --watchAll=false.  

Build Check: Ejecutar npm run build para asegurar que el proyecto compila correctamente para producción.  

Gatekeeper: El pipeline debe fallar si el coverage es menor al 70%.