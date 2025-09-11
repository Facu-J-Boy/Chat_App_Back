import Config from '../config';
import jwt from 'jsonwebtoken';

const { jwtSecret } = Config;

export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, jwtSecret) as { userId: number };
};
