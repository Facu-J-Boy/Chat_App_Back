import Config from '../config';
import jwt from 'jsonwebtoken';

const { jwtSecret, jwtRefreshSecret } = Config;

export const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, jwtSecret, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign({ userId }, jwtRefreshSecret, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, jwtRefreshSecret) as { userId: number };
};
