# --- Stage 1: build Angular ---
FROM public.ecr.aws/docker/library/node:20-alpine AS build

WORKDIR /app

# 1) Recibir el API_KEY desde el buildspec
ARG API_KEY
ENV API_KEY=${API_KEY}

COPY package*.json ./
RUN npm ci

COPY . .

# 2) Generar environment.prod.ts a partir de un template
#    (el template se comitea sin el valor real del API key)
RUN cp src/environments/environment.prod.template.ts src/environments/environment.ts && \
    sed -i "s#__API_KEY__#${API_KEY}#g" src/environments/environment.ts

# 3) build prod (Angular 20 genera dist/<app>/browser)
RUN npm run build -- --configuration=production

# --- Stage 2: Nginx ---
FROM public.ecr.aws/docker/library/nginx:alpine

# Nginx para SPA: fallback a index.html
COPY ops/nginx.conf /etc/nginx/conf.d/default.conf

# Copia el build Angular
COPY --from=build /app/dist/medisupply/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
