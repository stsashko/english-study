FROM node:16.14.0-alpine AS builder

WORKDIR /app

COPY ["client/package.json", "./"]

RUN npm install

COPY ./client/ .
COPY ./.env .

RUN npm run build



FROM nginx:alpine

COPY --from=builder /app/build /var/www/html
COPY ./docker/production/node-frontend/default.conf /etc/nginx/conf.d/default.conf


EXPOSE 7000

CMD ["nginx", "-g", "daemon off;"]