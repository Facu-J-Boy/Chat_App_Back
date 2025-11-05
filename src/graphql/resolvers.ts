import Chat from '../models/chat.model';
import Message from '../models/message.model';
import User from '../models/user.model'; // ajustá el path a tu modelo real
import { protectResolvers } from './wrapResolvers';
import { PubSub } from 'graphql-subscriptions';
import { createChat, getChats } from '../services/chat.service';
import { createMessage } from '../services/message.service';
import { UserModel } from '../models';

interface PubSubAsyncIterator extends PubSub {
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
}

const pubsub = new PubSub() as PubSubAsyncIterator;

export const rawResolvers = {
  Query: {
    users: async () => await User.findAll(),

    user: async (_: any, { id }: { id: number }) =>
      await User.findByPk(id),

    getChats: async (
      _: any,
      { isGroup }: { isGroup: boolean },
      { user }: { user: UserModel }
    ) => {
      return await getChats(user, isGroup);
    },

    getMessages: async (_: any, { chatId }: { chatId: number }) => {
      return await Message.findAll({
        where: { chatId },
        include: [User, Chat],
        order: [['createdAt', 'ASC']],
      });
    },
  },

  Mutation: {
    createUser: async (
      _: any,
      { name, email }: { name: string; email: string }
    ) => {
      const user = await User.create({ name, email });
      return user;
    },

    createChat: async (
      _: any,
      { userIds, name }: any,
      { user }: any
    ) => {
      return await createChat({ userIds, name, user });
    },

    sendMessage: async (
      _: any,
      { chatId, text }: any,
      { user }: any
    ) => {
      const message = await createMessage({
        chatId,
        senderId: user.id,
        text,
      });
      // const message = await Message.create({
      //   text,
      //   chatId,
      //   senderId: user.id,
      // });

      // const fullMessage = await Message.findByPk(message.id, {
      //   include: [User, Chat],
      // });

      pubsub.publish('MESSAGE_SENT', {
        messageSent: message,
      });

      return message;
    },
  },

  Subscription: {
    messageSent: {
      subscribe: () => pubsub.asyncIterator(['MESSAGE_SENT']),
      resolve: (payload: any, args: { chatId: number }) => {
        if (payload.messageSent.chatId === args.chatId)
          return payload.messageSent;
        return null;
      },
    },
  },
};

export const resolvers = protectResolvers(rawResolvers);
