const { gql } = require("apollo-server");
module.exports = gql`
  type User {
    id: ID!
    username: String!
    email: String
    createdAt: String!
    token: String
    imageUrl: String
    role:Role!
  }

  type Role {
    id: ID!
    name: String!
    slug: String!
  }

  type Seting {
    id: ID!
    nuit: String!
    name: String!
    phone: String!
    email: String!
    address: String!
    vat: String!
  }
  type Query {
    getUsers: [User]!
    login(username: String!, password: String!): User!
    seting: [Seting!]
    role: [Role!]
  }

  type Mutation {
    regiter(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
  }
`;
