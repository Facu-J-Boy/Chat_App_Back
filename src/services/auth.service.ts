import { Request, Response } from 'express';

const saludo = async (req: Request, res: Response) => {
  try {
    res.json({ saludo: 'hola' });
  } catch (error) {
    res.status(500).json({ msg: 'Error interno' });
  }
};

export default { saludo };
