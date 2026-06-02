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

# Custom nginx config για React Router (single-page app)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
