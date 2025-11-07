# --- Stage 1: build Angular ---
FROM public.ecr.aws/docker/library/node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# build prod (Angular 20 genera dist/<app>/browser)
RUN npm run build -- --configuration=production

# --- Stage 2: Nginx ---
FROM public.ecr.aws/docker/library/nginx:alpine
# Nginx para SPA: fallback a index.html
COPY ops/nginx.conf /etc/nginx/conf.d/default.conf
# Copia el build Angular
COPY --from=build /app/dist/medisupply/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
