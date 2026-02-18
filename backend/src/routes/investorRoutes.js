
import express from 'express';
import {
    getInvestors,
    createInvestor,
    updateInvestor,
    deleteInvestor,
    addInvestorPayment,
    updateInvestorPayment,
    deleteInvestorPayment,
} from '../controllers/investorController.js';
import protect from '../middleware/authMiddleware.js';
import { investorValidation, transactionValidation, validate } from '../middleware/validator.js';

const router = express.Router();

router.route('/')
    .get(protect, getInvestors)
    .post(protect, investorValidation, validate, createInvestor);

router.route('/:id')
    .put(protect, investorValidation, validate, updateInvestor)
    .delete(protect, deleteInvestor);

router.route('/:investorId/payments')
    .post(protect, transactionValidation, validate, addInvestorPayment);

router.route('/:investorId/payments/:paymentId')
    .put(protect, transactionValidation, validate, updateInvestorPayment)
    .delete(protect, deleteInvestorPayment);

export default router;
