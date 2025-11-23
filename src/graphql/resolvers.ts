import { protectResolvers } from './wrapResolvers';
import { createChat, getChats } from '../services/chat.service';
import { createMessage } from '../services/message.service';
import { ChatModel, MessageModel, UserModel } from '../models';

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
      { user, pubsub }: any
    ) => {
      const newMessage = await createMessage({
        user,
        chatId,
        senderId: user.id,
        text,
      });
      if (newMessage) {
        await pubsub.publish('MESSAGE_SENT', {
          messageSent: newMessage,
        });

        return newMessage;
      }
    },
  },

  Subscription: {
    messageSent: {
      subscribe: (_: any, __: any, { user, pubsub }: any) => {
        const iterator = pubsub.asyncIterator('MESSAGE_SENT');

        async function* filtered() {
          for await (const event of iterator) {
            if (
              event.messageSent.message.chat.users.some(
                (u: UserModel) => u.id === user.id
              )
            ) {
              yield event;
            }
          }
        }

        return filtered();
      },
    },
  },
};

export const resolvers = protectResolvers(rawResolvers);
