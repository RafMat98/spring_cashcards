# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (cache layer)
COPY package.json package-lock.json* ./
RUN npm install

# Copy code and build
COPY . .
RUN npm run build

# Stage 2: Serve με nginx
FROM nginx:alpine

# Copy built files in nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Selection config: local (default, without SSL) or prod (spring.rmat.gr + certbot)
ARG NGINX_ENV=local
COPY nginx.${NGINX_ENV}.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
