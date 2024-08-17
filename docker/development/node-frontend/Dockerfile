FROM node:16.14.0-alpine

WORKDIR /app

COPY ["client/package.json", "./"]

RUN npm install -g create-react-app
RUN npm install

RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache

EXPOSE 7000

CMD ["npm", "run", "dev"]