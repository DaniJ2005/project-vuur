# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build ----------
# Node image alleen gebruiken om de React app te bouwen.
FROM node:22-alpine AS builder

WORKDIR /app

# Eerst alleen de package files kopieren zodat npm ci gecachet kan worden
# zolang dependencies niet veranderen.
COPY package.json package-lock.json ./
RUN npm ci

# Daarna de rest van de source code en bouwen.
COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
# Kleine nginx image om alleen de statische build te serveren.
FROM nginx:1.27-alpine AS runner

# Eigen nginx config met SPA fallback (react-router BrowserRouter).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build artefacten (Vite -> dist/) naar de webroot.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx draait standaard al als foreground in deze image.
CMD ["nginx", "-g", "daemon off;"]
