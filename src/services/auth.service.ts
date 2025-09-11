import { Request, Response } from 'express';
import User from '../models/user.model';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';

const signup = async (req: Request, res: Response) => {
  try {
    const { name, userName, email, password } = req.body;

    if (!name || !userName || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      userName,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      message: 'Usuario registrado',
      token,
      user: {
        id: user.id,
        name: user.name,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'Error al registrar', err });
  }
};

const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      //Comparamos la contraseña
      const validPassword = await bcrypt.compare(
        password,
        user.password
      );
      if (!validPassword) {
        res.status(400).json({ message: 'Invalid password' });
      }
      const token = generateToken(user.id);

      return res.json({
        message: `Welcome ${user.name}`,
        user,
        token,
      });
    } else {
      res.status(400).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
};

const singleUser = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  try {
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }, //  nunca devolvemos la contraseña
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Search user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { signup, signIn, singleUser };
