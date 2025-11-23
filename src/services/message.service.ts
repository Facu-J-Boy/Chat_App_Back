import {
  ChatModel,
  MessageModel,
  UserChatModel,
  UserModel,
} from '../models';

interface CreateMessageDTO {
  user: UserModel;
  chatId: number;
  senderId: number;
  text: string;
}

// interface ChatItem {
//     id: number
//     name: string
//     chat_image: string
//     isGroup: boolean
//     users: UserModel[] | undefined
//     lastMessage: MessageModel | null
//   }

export const createMessage = async (data: CreateMessageDTO) => {
  const { user, chatId, senderId, text } = data;

  const exist = await UserChatModel.findOne({
    where: { userId: senderId, chatId },
  });

  if (!exist) {
    throw new Error('No formas parte de este chat');
  }

  const message = await MessageModel.create({
    chatId,
    senderId,
    text,
  });

  const fullMessage = await MessageModel.findByPk(message.id, {
    include: [
      { model: UserModel, as: 'sender' },
      {
        model: ChatModel,
        as: 'chat',
        include: [{ model: UserModel, as: 'users' }],
      },
    ],
  });

  return {
    message: fullMessage,
    chatSummary: {
      ...fullMessage?.chat.toJSON(),
      users: fullMessage?.chat.users.filter(
        (u: UserModel) => u.id !== user.id
      ),
      lastMessage: fullMessage,
    },
  };
};

export default { createMessage };
