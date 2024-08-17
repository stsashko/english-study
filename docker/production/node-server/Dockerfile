FROM node:16.14.0-alpine

WORKDIR /app

COPY ["server/package.json", "./"]

COPY ./server/ .
COPY ["server/prisma", "./prisma/"]

RUN npx prisma generate

RUN npm install
RUN npm i npm-run-all -g

EXPOSE 5000

CMD ["npm", "run", "build"]