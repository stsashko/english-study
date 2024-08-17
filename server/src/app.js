const path = require("path");

const dotenv = require("dotenv");
dotenv.config();

// const url = `postgresql://${config.dbUsername}:${config.dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}`

// process.env.DATABASE_URL = url

const { ApolloServer } = require("apollo-server-express");
const { PrismaClient } = require("@prisma/client");

const express = require("express");
// const cors = require('cors');

const { graphqlUploadExpress } = require("graphql-upload");

const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");

const schema = require("./schema.graphql.js");

const { getUserId } = require("./utils/auth");

const prisma = new PrismaClient();

async function startServer() {
  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      return {
        ...req,
        prisma,
        isAuth: () => {
          let result = req && req.headers.authorization ? getUserId(req) : null;
          if (!result) throw new Error("Not authenticated");
        },
        userId: req && req.headers.authorization ? getUserId(req) : null,
      };
    },
    formatError: (err) => {
      if (err.message.startsWith("Database Error: ")) {
        return new Error("Internal server error");
      }
      err.extensions.exception.stacktrace = [];
      return err;
    },

    cache: "bounded",
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    uploads: false,
  });

  await server.start();

  const app = express();

  app.use(express.static(path.join(__dirname, "..", "public")));

  app.use(graphqlUploadExpress({ maxFileSize: 2000000, maxFiles: 10 }));

  // app.use(cors(corsOptions))
  // const corsOptions = {
  //     origin: 'http://localhost:3000',
  //     credentials: true
  // }
  // app.use(cors(corsOptions))
  // app.use(graphqlUploadExpress({ maxFileSize: 10000, maxFiles: 10 }));

  server.applyMiddleware({
    app,
    path: "/",
    // cors: corsOptions,
  });

  await app.listen(process.env.NODE_SERVER_PORT);

  console.log(
    `🚀 Server ready at http://localhost:${process.env.NODE_SERVER_PORT}${server.graphqlPath}`
  );
}
startServer();
