
import express from 'express';
import { login } from '../controllers/authController.js';
import { authValidation, validate } from '../middleware/validator.js';

const router = express.Router();

router.post('/login', authValidation, validate, login);

export default router;
