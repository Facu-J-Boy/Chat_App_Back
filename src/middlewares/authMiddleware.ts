import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Config from '../config';
const { jwtSecret } = Config;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'Invalid token' });

    // @ts-ignore
    req.user = user; // guardamos los datos decodificados
    next();
  });
};
