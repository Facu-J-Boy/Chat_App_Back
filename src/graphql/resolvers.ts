import { protectResolvers } from './wrapResolvers';
import { createChat, getChats } from '../services/chat.service';
import { createMessage } from '../services/message.service';
import { MessageModel, UserModel } from '../models';
import { pubsub } from './pubsub';

export const rawResolvers = {
  Query: {
    users: async () => await UserModel.findAll(),

    user: async (_: any, { id }: { id: number }) =>
      await UserModel.findByPk(id),

    getChats: async (
      _: any,
      { isGroup }: { isGroup: boolean },
      { user }: { user: UserModel }
    ) => {
      return await getChats(user, isGroup);
    },

    getMessages: async (_: any, { chatId }: { chatId: number }) => {
      return await MessageModel.findAll({
        where: { chatId },
        include: [UserModel],
        order: [['createdAt', 'DESC']],
      });
    },
  },

  Mutation: {
    createUser: async (
      _: any,
      { name, email }: { name: string; email: string }
    ) => {
      const user = await UserModel.create({ name, email });
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
      const newMessage = await createMessage({
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
      if (newMessage) {
        await pubsub.publish(`MESSAGE_SENT_${chatId}`, {
          messageSent: newMessage,
        });

        return newMessage;
      }
    },
  },

  Subscription: {
    messageSent: {
      subscribe: (_: any, { chatId }: { chatId: number }) => {
        console.log('Subscribing to chatId', chatId);
        return pubsub.asyncIterableIterator([
          `MESSAGE_SENT_${chatId}`,
        ]);
      },
      resolve: (payload: any) => {
        console.log('Payload received in resolve:', payload);
        return payload.messageSent;
      },
    },
  },
};

export const resolvers = protectResolvers(rawResolvers);
