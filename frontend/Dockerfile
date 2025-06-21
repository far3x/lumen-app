# Stage 1: Build the Vue application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# This receives the build argument from docker-compose.yml
ARG VITE_GOOGLE_RECAPTCHA_SITE_KEY
ENV VITE_GOOGLE_RECAPTCHA_SITE_KEY=${VITE_GOOGLE_RECAPTCHA_SITE_KEY}

RUN npm run build

# Stage 2: Serve the built static files with Nginx
FROM nginx:stable-alpine
# Copy the built assets from the 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
