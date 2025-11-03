import { Request, Response } from 'express';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import * as userService from '../services/user.service';
import { UserModel } from '../models';

const signup = async (req: Request, res: Response) => {
  try {
    const { name, userName, email, password } = req.body;

    const user = await userService.signUpUser({
      name,
      userName,
      email,
      password,
    });
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Guardar refreshToken en cookie HTTP-only
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });
    return res
      .status(200)
      .json({ message: 'usuario registrado', accessToken, user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await userService.signInUser({ email, password });

    if (user) {
      const { accessToken, refreshToken } = generateTokens(user.id);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      res.status(201).json({
        message: `Welcome ${user.name}`,
        accessToken,
        user,
      });
    }
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

const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: 'No refresh token found' });
    }

    // ✅ Verificamos el refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Verificamos que el usuario aún exista
    const user = await UserModel.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🔄 Generamos nuevos tokens
    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(user.id);

    // 🧁 Actualizamos la cookie con el nuevo refresh token
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res
      .status(403)
      .json({ message: 'Invalid or expired refresh token' });
  }
};

export default { signup, signIn, singleUser, refresh };
