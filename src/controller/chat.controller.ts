import { Request, Response } from 'express';
import * as chatService from '../services/chat.service';

const createNewChat = async (req: Request, res: Response) => {
  try {
    const { userIds, senderId, text, name, isGroup } = req.body;

    const result = await chatService.createChatWithMessage({
      userIds,
      senderId,
      text,
      name,
      isGroup,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export default { createNewChat };
