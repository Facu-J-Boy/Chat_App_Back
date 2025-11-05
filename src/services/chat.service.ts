import { Op, Sequelize } from 'sequelize';
import {
  ChatModel,
  MessageModel,
  UserChatModel,
  UserModel,
} from '../models';
import * as messageService from './message.service';

interface CreateChatWithMessageDTO {
  userIds: number[]; // usuarios que participan en el chat
  senderId: number; // usuario que envía el mensaje inicial
  text: string; // mensaje inicial
  name?: string; // opcional, solo para grupos
  isGroup?: boolean; // true si es un grupo
}

interface CreateChatDTO {
  userIds: number[];
  name: string;
  user: UserModel;
}

// export const createChatWithMessage = async (
//   data: CreateChatWithMessageDTO
// ) => {
//   const { userIds, senderId, text, name, isGroup = false } = data;

//   // 1. Crear el chat
//   const chat = await ChatModel.create({
//     name,
//     isGroup,
//   });

//   // 2. Relacionar usuarios con el chat
//   const users = await UserModel.findAll({ where: { id: userIds } });
//   if (users.length !== userIds.length) {
//     throw new Error('Uno o más usuarios no existen');
//   }
//   await chat.$set('users', users);

//   // 3. Crear el mensaje inicial
//   const message = await messageService.createMessage(
//     chat.id,
//     senderId,
//     text
//   );

//   return { chat, message };
// };

export const createChat = async (data: CreateChatDTO) => {
  const { userIds, name } = data;
  // try {
  if (userIds.length < 2) {
    throw new Error('Se requieren al menos dos usuarios');
  }
  // 🔍 Verificar si ya existe un chat entre los mismos dos usuarios (solo si no es grupo)
  if (userIds.length === 2) {
    const existingChats = await ChatModel.findAll({
      include: [
        {
          model: UserModel,
          as: 'users',
          through: { attributes: [] }, // ignora columnas intermedias
          where: {
            id: { [Op.in]: userIds },
          },
        },
      ],
    });

    // Filtramos los chats que tienen exactamente esos dos usuarios
    const existingChat = existingChats.find(
      (chat: any) => chat.users.length === 2
    );

    if (existingChat) {
      throw new Error('Ya existe un chat entre esos usuarios');
    }
  }

  let isGroup = false;

  if (userIds.length > 2) {
    isGroup = true;
  }

  const chat = await ChatModel.create({ name, isGroup });

  await Promise.all(
    userIds.map((id: number) =>
      UserChatModel.create({ userId: id, chatId: chat.id })
    )
  );

  // 🔹 Vuelve a consultar el chat con las relaciones
  const fullChat = await ChatModel.findByPk(chat.id, {
    include: [
      { model: UserModel, as: 'users' },
      { model: MessageModel, as: 'messages' },
    ],
  });

  if (!fullChat)
    throw new Error('Chat no encontrado tras la creación');

  return fullChat;
  // } catch (error) {
  //   throw new Error('No se pudo crear el chat');
  // }
};

export const getChats = async (user: UserModel, isGroup: boolean) => {
  const chats = await ChatModel.findAll({
    where: { isGroup },
    include: [
      // Incluye solo para filtrar: asegurar que el usuario participa
      {
        model: UserModel,
        as: 'currentUser',
        through: { attributes: [] },
        required: true,
        where: { id: user.id },
      },
      // Incluye todos los usuarios del chat
      {
        model: UserModel,
        as: 'users',
        through: { attributes: [] },
      },
      {
        model: MessageModel,
        as: 'messages',
        include: [UserModel],
        limit: 1,
        order: [['createdAt', 'DESC']], // el más reciente
      },
    ],
    order: [
      // 🔥 Subconsulta para ordenar por el último mensaje
      [
        Sequelize.literal(`(
          SELECT MAX(m.createdAt)
          FROM messages AS m
          WHERE m.chatId = Chat.id
        )`),
        'DESC',
      ],
    ],
  });

  const formattedChats = chats.map((chat: ChatModel) => ({
    ...chat.toJSON(),
    users: chat.users.filter((u: UserModel) => u.id !== user.id),
    lastMessage: chat.messages[0] || null,
  }));

  return formattedChats;
};
