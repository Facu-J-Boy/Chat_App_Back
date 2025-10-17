import { Request, Response } from 'express';
import { generateTokens, verifyToken } from '../utils/jwt';
import * as userService from '../services/user.service';

const signup = async (req: Request, res: Response) => {
  try {
    const { name, userName, email, password } = req.body;

    const result = await userService.signUpUser({
      name,
      userName,
      email,
      password,
    });
    return res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await userService.signInUser({ email, password });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const singleUser = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    const result = await userService.getSingleUser(userId);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Search user error:', error);
    return res.status(400).json({ error: error.message });
  }
};

const refresh = (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token)
    return res
      .status(401)
      .json({ message: 'Refresh token requerido' });

  try {
    const decoded = verifyToken(token);
    const { accessToken, refreshToken } = generateTokens(
      decoded.userId
    );
    res.json({ accessToken, refreshToken });
  } catch {
    return res
      .status(403)
      .json({ message: 'Refresh token inválido' });
  }
};

export default { signup, signIn, singleUser, refresh };
