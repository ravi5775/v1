import Loan from '../models/Loan.js';
import { getLoanStatus } from '../utils/planCalculations.js';
import { broadcast } from '../services/websocket.js';

export const getLoans = async (req, res, next) => {
    try {
        const loans = await Loan.find({}).sort({ created_at: -1 });
        res.json(loans.map(loan => loan.toJSON()));
    } catch (error) {
        next(error);
    }
};

export const createLoan = async (req, res, next) => {
    try {
        const newLoan = new Loan({
            ...req.body,
            user_id: req.user.id,
            status: 'Active'
        });
        const savedLoan = await newLoan.save();
        // Push the actual new object
        broadcast({ type: 'LOAN_CREATED', data: savedLoan.toJSON() });
        res.status(201).json(savedLoan.toJSON());
    } catch (error) {
        next(error);
    }
};

export const updateLoan = async (req, res, next) => {
    try {
        const updatedLoan = await Loan.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updated_at: new Date() },
            { new: true }
        );

        if (!updatedLoan) return res.status(404).json({ message: 'Loan not found' });
        
        broadcast({ type: 'LOAN_UPDATED', data: updatedLoan.toJSON() });
        res.json(updatedLoan.toJSON());
    } catch (error) {
        next(error);
    }
};

export const deleteLoans = async (req, res, next) => {
    const { ids } = req.body;
    try {
        await Loan.deleteMany({ _id: { $in: ids } });
        broadcast({ type: 'LOANS_DELETED', data: ids });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const syncLoanStatus = async (loanId) => {
    const loan = await Loan.findById(loanId);
    if (!loan) return null;

    const newStatus = getLoanStatus(loan.toJSON());
    if (loan.status !== newStatus) {
        loan.status = newStatus;
        const updated = await loan.save();
        return updated;
    }
    return loan;
};

export const addTransaction = async (req, res, next) => {
    const { loanId } = req.params;
    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        
        loan.transactions.push({ ...req.body, user_id: req.user.id });
        await loan.save();

        const updatedLoan = await syncLoanStatus(loanId);
        broadcast({ type: 'LOAN_UPDATED', data: updatedLoan.toJSON() });
        res.status(201).json({ message: 'Transaction added' });
    } catch (error) {
        next(error);
    }
};

export const updateTransaction = async (req, res, next) => {
    const { loanId, transactionId } = req.params;
    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        
        const transaction = loan.transactions.id(transactionId);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        transaction.set(req.body);
        await loan.save();

        const updatedLoan = await syncLoanStatus(loanId);
        broadcast({ type: 'LOAN_UPDATED', data: updatedLoan.toJSON() });
        res.json({ message: 'Transaction updated' });
    } catch (error) {
        next(error);
    }
};

export const deleteTransaction = async (req, res, next) => {
    const { loanId, transactionId } = req.params;
    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        loan.transactions.pull(transactionId);
        await loan.save();

        const updatedLoan = await syncLoanStatus(loanId);
        broadcast({ type: 'LOAN_UPDATED', data: updatedLoan.toJSON() });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};