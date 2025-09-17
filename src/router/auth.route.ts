import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { AuthController } from '../controller';

const router = Router();

const { signup, signIn, singleUser, refresh } = AuthController;

router.post('/signup', signup);

router.post('/signin', signIn);

router.get('/me', authMiddleware, singleUser);

router.post('/refresh', refresh);

module.exports = router;
