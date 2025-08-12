# Stage 1: Build the Vue application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ACCEPT THE BUILD ARGUMENT
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# This receives the build argument from docker-compose.yml
ARG VITE_GOOGLE_RECAPTCHA_SITE_KEY
ENV VITE_GOOGLE_RECAPTCHA_SITE_KEY=${VITE_GOOGLE_RECAPTCHA_SITE_KEY}

RUN npm run build

# Stage 2: Serve the built static files with Nginx
FROM nginx:stable-alpine
# Copy the built assets from the 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html
# Overwrite the built index.html with our placeholder version
COPY index.html /usr/share/nginx/html/index.html
# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]