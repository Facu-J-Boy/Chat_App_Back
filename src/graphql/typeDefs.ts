export const typeDefs = `#graphql

enum MessageStatus {
  sent
  delivered
  read
}

  type User {
    id: Int!
    name: String!
    email: String!
    profile_image: String
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
    chat_image: String
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
    status: MessageStatus!
  }

    type MessageSentResponse {
    message: Message
    chatSummary: ChatItem
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    getChats(isGroup: Boolean): [ChatItem!]!
    getMessages(chatId: Int!): [Message!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
    createChat(userIds: [Int!]!, name: String): Chat
    sendMessage(chatId: Int!, text: String!, createdAt: String!): MessageSentResponse!
  }

  type Subscription {
    messageSent: MessageSentResponse
  }
`;
