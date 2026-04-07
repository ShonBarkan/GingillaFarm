FROM node:20-slim AS build-stage
WORKDIR /app
ARG VITE_ICONS_API_URL
ENV VITE_ICONS_API_URL=$VITE_ICONS_API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8300

CMD ["nginx", "-g", "daemon off;"]