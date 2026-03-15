# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
# Vite needs build-time env variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# 1. Copy built files
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 2. Copy your custom config to override the default
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Documentation (Keep this 3100)
EXPOSE 3100

CMD ["nginx", "-g", "daemon off;"]