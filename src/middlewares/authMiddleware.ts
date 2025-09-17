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
    console.log('Token required');
    return res
      .status(401)
      .json({ user: null, message: 'Token required' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.log('Invalid token');
      return res
        .status(403)
        .json({ user: null, message: 'Invalid token' });
    }

    // @ts-ignore
    req.user = user; // guardamos los datos decodificados
    next();
  });
};
