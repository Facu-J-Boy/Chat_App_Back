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
  createdAt: number;
}

const serializeMessage = (msg: MessageModel) => ({
  ...msg.toJSON(),
  createdAt:
    msg.createdAt instanceof Date
      ? msg.createdAt.toISOString()
      : msg.createdAt,
});

// interface ChatItem {
//     id: number
//     name: string
//     chat_image: string
//     isGroup: boolean
//     users: UserModel[] | undefined
//     lastMessage: MessageModel | null
//   }

export const createMessage = async (data: CreateMessageDTO) => {
  const { user, chatId, senderId, text, createdAt } = data;

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
    createdAt,
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

  if (fullMessage) {
    return {
      message: serializeMessage(fullMessage),
      chatSummary: {
        ...fullMessage?.chat.toJSON(),
        users: fullMessage?.chat.users.filter(
          (u: UserModel) => u.id !== user.id
        ),
        lastMessage: serializeMessage(fullMessage),
      },
    };
  }
};

export const getMessageList = async (chatId: number) => {
  const messages = await MessageModel.findAll({
    where: { chatId },
    include: [UserModel],
    order: [['createdAt', 'DESC']],
  });

  return messages.map((msg) => serializeMessage(msg));
};
