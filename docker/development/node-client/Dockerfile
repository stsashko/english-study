FROM node:16.14.0-alpine

WORKDIR /app

COPY ["server/package.json", "server/package-lock.json", "./"]

RUN npm install

COPY ./client/ .

EXPOSE 3000

CMD ["npm", "run", "build"]