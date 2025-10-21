import Chat from '../models/chat.model';
import Message from '../models/message.model';
import User from '../models/user.model'; // ajustá el path a tu modelo real
import { protectResolvers } from './wrapResolvers';
import { PubSub } from 'graphql-subscriptions';
import UserChat from '../models/userChat.model';

const pubsub = new PubSub();

export const rawResolvers = {
  Query: {
    users: async () => await User.findAll(),

    user: async (_: any, { id }: { id: number }) =>
      await User.findByPk(id),

    getChats: async () => {
      const chats = await Chat.findAll({
        include: [
          { model: User, through: { attributes: [] } },
          { model: Message, include: [User] },
        ],
      });

      return chats;
    },

    getMessages: async (_: any, { chatId }: any) => {
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
      { userIds, name, isGroup }: any,
      { user }: any
    ) => {
      try {
        console.log({ user });
        console.log('createChat ejecutado');

        const chat = await Chat.create({ name, isGroup });

        await Promise.all(
          userIds.map((id: number) =>
            UserChat.create({ userId: id, chatId: chat.id })
          )
        );

        // 🔹 Vuelve a consultar el chat con las relaciones
        const fullChat = await Chat.findByPk(chat.id, {
          include: [
            { model: User, as: 'users' },
            { model: Message, as: 'messages' },
          ],
        });

        if (!fullChat)
          throw new Error('Chat no encontrado tras la creación');

        console.log('✅ Chat creado con éxito:', fullChat.toJSON());
        return fullChat;
      } catch (error) {
        console.error('❌ Error en createChat:', error);
        throw new Error('No se pudo crear el chat');
      }
    },

    sendMessage: async (
      _: any,
      { chatId, text }: any,
      { user }: any
    ) => {
      const message = await Message.create({
        text,
        chatId,
        senderId: user.id,
      });

      const fullMessage = await Message.findByPk(message.id, {
        include: [User, Chat],
      });

      pubsub.publish('MESSAGE_SENT', {
        messageSent: fullMessage,
      });

      return fullMessage;
    },
  },
};

export const resolvers = protectResolvers(rawResolvers);
