export const typeDefs = `#graphql
  type User {
    id: Int!
    name: String!
    email: String!
  }

  type Chat {
    id: Int!
    name: String
    isGroup: Boolean!
    users: [User]
    messages: [Message]
  }

  type ChatItem {
    id: Int!
    name: String
    isGroup: Boolean!
    users: [User]
    lastMessage: Message
  }

  type Message {
    id: Int!
    text: String!
    sender: User!
    chat: Chat!
    createdAt: String!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    getChats: [ChatItem!]!
    getMessages(chatId: Int!): [Message!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    createChat(userIds: [Int!]!, name: String): Chat
    sendMessage(chatId: Int!, text: String!): Message!
  }

  type Subscription {
    messageSent(chatId: Int!): Message!
  }
`;
