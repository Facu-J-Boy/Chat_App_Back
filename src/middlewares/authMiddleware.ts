import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer <token>"

  if (!token) {
    console.log('Token required');
    return res
      .status(401)
      .json({ user: null, message: 'Token required' });
  }

  try {
    const decoded = verifyAccessToken(token); // ✅ usamos tu helper
    (req as any).user = decoded; // guardamos el usuario decodificado
    next();
  } catch (error) {
    console.log('Invalid or expired token:', error);
    return res
      .status(403)
      .json({ user: null, message: 'Invalid or expired token' });
  }
};
