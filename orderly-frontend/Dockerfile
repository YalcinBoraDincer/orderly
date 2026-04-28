# ── AŞAMA 1: BUILD ──────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Docker'da API relative URL kullan (Nginx proxy yapacak)
ENV VITE_API_URL=""

RUN npm run build

# ── AŞAMA 2: NGINX ile SERVE ─────────────────────────
FROM nginx:alpine

# Build çıktısını Nginx'e kopyala
COPY --from=build /app/dist /usr/share/nginx/html

# Kendi nginx config'imizi koy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
