FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_GOOGLE_RECAPTCHA_SITE_KEY
ENV VITE_GOOGLE_RECAPTCHA_SITE_KEY=${VITE_GOOGLE_RECAPTCHA_SITE_KEY}

RUN npm run build

FROM nginx:stable-alpine
RUN apk add --no-cache curl
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]