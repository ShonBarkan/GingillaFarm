FROM node:20-slim AS build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 8300

CMD ["nginx", "-g", "daemon off;"]