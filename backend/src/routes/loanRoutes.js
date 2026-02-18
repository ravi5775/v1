
import express from 'express';
import {
    getLoans,
    createLoan,
    updateLoan,
    deleteLoans,
    addTransaction,
    updateTransaction,
    deleteTransaction,
} from '../controllers/loanController.js';
import protect from '../middleware/authMiddleware.js';
import { loanValidation, transactionValidation, validate } from '../middleware/validator.js';

const router = express.Router();

router.route('/')
    .get(protect, getLoans)
    .post(protect, loanValidation, validate, createLoan);

router.post('/delete-multiple', protect, deleteLoans);

router.route('/:id')
    .put(protect, loanValidation, validate, updateLoan);

router.route('/:loanId/transactions')
    .post(protect, transactionValidation, validate, addTransaction);

router.route('/:loanId/transactions/:transactionId')
    .put(protect, transactionValidation, validate, updateTransaction)
    .delete(protect, deleteTransaction);

export default router;
