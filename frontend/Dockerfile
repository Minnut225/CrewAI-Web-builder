# =======================================================
# Stage 1: Build Frontend Assets with Node.js 20
# =======================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install npm dependencies
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# =======================================================
# Stage 2: Serve Production Assets with Nginx
# =======================================================
FROM nginx:alpine

# Remove default static pages
RUN rm -rf /usr/share/nginx/html/*

# Copy built distribution from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
