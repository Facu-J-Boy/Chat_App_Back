import { ChatModel, MessageModel, UserModel } from '../models';

interface CreateMessageDTO {
  chatId: number;
  senderId: number;
  text: string;
}

export const createMessage = async (data: CreateMessageDTO) => {
  const { chatId, senderId, text } = data;

  const message = await MessageModel.create({
    chatId,
    senderId,
    text,
  });

  const fullMessage = await MessageModel.findByPk(message.id, {
    include: [
      { model: UserModel, as: 'sender' },
      { model: ChatModel, as: 'chat' },
    ],
  });

  return fullMessage;
};

export default { createMessage };
