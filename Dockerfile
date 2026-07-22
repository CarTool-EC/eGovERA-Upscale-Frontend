# Stage 1: Build the Angular app
FROM node:22.21.1-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN npx ng build --configuration production

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
COPY nginx_default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]