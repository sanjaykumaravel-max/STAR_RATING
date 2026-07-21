# syntax=docker/dockerfile:1

# Stage 1 - build the React/Vite application reproducibly.
FROM node:22.23.1-alpine3.23 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 - serve the immutable build with Nginx.
FROM nginx:1.31.3-alpine3.24

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
