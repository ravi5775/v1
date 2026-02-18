
import express from 'express';
import { 
    createAdmin, 
    changePassword, 
    getLoginHistory, 
    restoreBackup 
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';
import { 
    adminCreateValidation, 
    passwordChangeValidation, 
    validate 
} from '../middleware/validator.js';

const router = express.Router();

router.post('/create', protect, adminCreateValidation, validate, createAdmin);
router.put('/change-password', protect, passwordChangeValidation, validate, changePassword);
router.get('/login-history', protect, getLoginHistory);
router.post('/restore', protect, restoreBackup);

export default router;
