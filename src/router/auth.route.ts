import { Router } from 'express';
import { AuthService } from '../services';

const router = Router();

const { saludo } = AuthService;

router.get('/saludo', saludo);

module.exports = router;
