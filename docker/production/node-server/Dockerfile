FROM node:16.14.0-alpine

WORKDIR /app

COPY ["server/package.json", "server/package-lock.json", "./"]

RUN npm install

COPY ./server/ .

RUN cd src && npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "build"]
#CMD ["npm", "run", "dev"]