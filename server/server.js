const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const { authMiddleware } = require("./utils/auth");

const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");

// run the application to the available Heroku PORT - fall back to local dev
const port = process.env.PORT || 3001;
const app = express();
// create new Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // here we have defined the context as authMiddleware - this can be used by all of our resolvers
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  // app.use, our client build folder
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  // Implement the Apollo Server and apply it to the Express server as middleware.
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(port, () => {
      console.log(`API server running on port ${port}!`);
      console.log(
        `Use GraphQL at http://localhost:${port}${server.graphqlPath}`
      );
    });
  });
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);

// hello