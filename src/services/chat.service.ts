import { ChatModel, UserModel } from '../models';
import * as messageService from './message.service';

interface CreateChatDTO {
  userIds: number[]; // usuarios que participan en el chat
  senderId: number; // usuario que envía el mensaje inicial
  text: string; // mensaje inicial
  name?: string; // opcional, solo para grupos
  isGroup?: boolean; // true si es un grupo
}

export const createChatWithMessage = async (data: CreateChatDTO) => {
  const { userIds, senderId, text, name, isGroup = false } = data;

  // 1. Crear el chat
  const chat = await ChatModel.create({
    name,
    isGroup,
  });

  // 2. Relacionar usuarios con el chat
  const users = await UserModel.findAll({ where: { id: userIds } });
  if (users.length !== userIds.length) {
    throw new Error('Uno o más usuarios no existen');
  }
  await chat.$set('users', users);

  // 3. Crear el mensaje inicial
  const message = await messageService.createMessage(
    chat.id,
    senderId,
    text
  );

  return { chat, message };
};
