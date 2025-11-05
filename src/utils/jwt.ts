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

// Verifica el access token
export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, jwtSecret) as { userId: number };
};

// Verifica el refresh token
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, jwtRefreshSecret) as { userId: number };
};
