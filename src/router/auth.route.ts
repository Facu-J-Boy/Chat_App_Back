import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { AuthService } from '../services';

const router = Router();

const { signup, signIn, singleUser, refresh } = AuthService;

router.post('/signup', signup);

router.post('/signin', signIn);

router.get('/me', authMiddleware, singleUser);

router.post('/refresh', refresh);

module.exports = router;
