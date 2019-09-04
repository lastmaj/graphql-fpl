const { GraphQLServer } = require("graphql-yoga");
const fetch = require("node-fetch");

const baseURL = "https://jsonplaceholder.typicode.com";

const typeDefs = `
  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
  }

  type User {
    id: ID!
    name: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    author: User!
  }
`;

const resolvers = {
  Query: {
    users: fetch(`${baseURL}/users`).then(res => res.json()),
    user: (parent, args) => {
      const { id } = args;
      return fetch(`${baseURL}/users/${id}`).then(res => res.json());
    },
    posts: () => {
      return fetch(`${baseURL}/posts`).then(res => res.json());
    },
    post: (parent, args) => {
      const { id } = args;
      return fetch(`${baseURL}/posts/${id}`).then(res => res.json());
    }
  },

  User: {
    posts: parent => {
      const { id } = parent;
      return fetch(`${baseURL}/posts/?userId=${id}`).then(res => res.json());
    }
  },

  Post: {
    author: parent => {
      const { id } = parent;
      return fetch(`${baseURL}/users/${id}`).then(res => res.json());
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(() => console.log("Server is running on port 4000"));
