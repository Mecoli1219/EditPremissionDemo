import { GraphQLServer, PubSub } from "graphql-yoga";
import dotenv from "dotenv-defaults";
import Account from "../models/account";
import Frame from "../models/frame";
import connectMongo from "./connectMongo";
import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
// import Subscription from "./resolvers/Subscription";
// import User from "./resolvers/User";
// import Post from "./resolvers/Post";
// import Comment from "./resolvers/Comment";

dotenv.config();

const db = connectMongo();

const pubsub = new PubSub();

const server = new GraphQLServer({
  typeDefs: "./server/src/schema.graphql",
  resolvers: {
    Query,
    Mutation,
  },
  context: {
    Account,
    Frame,
    pubsub,
  },
});

server.start({ port: process.env.PORT | 5000 }, () => {
  console.log(`The server is up on port ${process.env.PORT | 5000}!`);
});
