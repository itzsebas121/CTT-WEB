# =========================================
# Stage 1: Build React (Vite)
# =========================================
FROM node:18-alpine AS build

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias primero (mejor cache de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Construir la aplicación React (genera /dist)
RUN npm run build


# =========================================
# Stage 2: Production - Nginx
# =========================================
FROM nginx:stable-alpine

# Eliminar configuración por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar build de React desde el stage anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]