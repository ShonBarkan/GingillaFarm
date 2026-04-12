# --- Build Stage ---
FROM node:20-slim AS build-stage
WORKDIR /app

# Define Build Arguments
ARG VITE_MITAMNIM_API_URL
ARG VITE_ICONS_API_URL
ARG CACHE_KEY_MITAMNIM

# Set Environment Variables (Required for Vite during 'npm run build')
ENV VITE_MITAMNIM_API_URL=$VITE_MITAMNIM_API_URL
ENV VITE_ICONS_API_URL=$VITE_ICONS_API_URL
ENV CACHE_KEY_MITAMNIM=$CACHE_KEY_MITAMNIM

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# --- Production Stage ---
FROM nginx:stable-alpine

# Copy built assets from build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port we defined in nginx.conf
EXPOSE 8400

CMD ["nginx", "-g", "daemon off;"]