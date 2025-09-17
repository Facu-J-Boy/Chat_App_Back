import { MessageModel } from '../models';

export const createMessage = async (
  chatId: number,
  senderId: number,
  text: string
) => {
  return await MessageModel.create({ chatId, senderId, text });
};

export default { createMessage };
