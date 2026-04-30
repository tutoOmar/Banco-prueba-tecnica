# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Run tests and build (CI mode)
# Note: In a real CI environment, tests would run in the pipeline, 
# but here we ensure the image is built with a successful build.
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:stable-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from stage 1
# Note: Angular 19 usually builds to dist/<project-name>/browser
COPY --from=build /app/dist/bp-financial-products/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
