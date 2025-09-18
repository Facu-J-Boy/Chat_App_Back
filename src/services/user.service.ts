import { UserModel } from '../models';
import bcrypt from 'bcryptjs';
import { generateTokens } from '../utils/jwt';

interface SignUpDTO {
  name: string;
  userName: string;
  email: string;
  password: string;
}

interface SignInDTO {
  email: string;
  password: string;
}

export const signUpUser = async (data: SignUpDTO) => {
  const { name, userName, email, password } = data;

  if (!name || !userName || !email || !password) {
    throw new Error('Faltan datos');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    userName,
    email,
    password: hashedPassword,
  });

  const { accessToken, refreshToken } = generateTokens(user.id);

  return {
    message: 'Usuario registrado',
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      userName: user.userName,
      email: user.email,
    },
  };
};

export const signInUser = async (data: SignInDTO) => {
  const { email, password } = data;
  const user = await UserModel.findOne({
    where: { email },
  });
  if (!user) {
    throw new Error('User not found');
  } else {
    //Comparamos la contraseña
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      throw new Error('Invalid password');
    }
    const { accessToken, refreshToken } = generateTokens(user.id);

    const signInUser = await UserModel.findOne({
      where: { email },
      attributes: {
        exclude: ['password'],
      },
    });
    return {
      message: `Welcome ${user.name}`,
      accessToken,
      refreshToken,
      user: signInUser,
    };
  }
};

export const getSingleUser = async (userId: number) => {
  if (!userId) {
    throw new Error('serId is required');
  }
  const user = await UserModel.findByPk(userId, {
    attributes: { exclude: ['password'] }, //  nunca devolvemos la contraseña
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
