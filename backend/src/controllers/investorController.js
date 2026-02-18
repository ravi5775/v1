import Investor from '../models/Investor.js';
import { broadcast } from '../services/websocket.js';

export const getInvestors = async (req, res, next) => {
    try {
        const investors = await Investor.find({}).sort({ created_at: -1 });
        res.json(investors.map(inv => inv.toJSON()));
    } catch (error) {
        next(error);
    }
};

export const createInvestor = async (req, res, next) => {
    try {
        const newInvestor = new Investor({
            ...req.body,
            user_id: req.user.id
        });
        const savedInvestor = await newInvestor.save();
        broadcast({ type: 'INVESTOR_CREATED', data: savedInvestor.toJSON() });
        res.status(201).json(savedInvestor.toJSON());
    } catch (error) {
        next(error);
    }
};

export const updateInvestor = async (req, res, next) => {
    try {
        const updatedInvestor = await Investor.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updated_at: new Date() },
            { new: true }
        );
        if (!updatedInvestor) return res.status(404).json({ message: 'Investor not found' });
        broadcast({ type: 'INVESTOR_UPDATED', data: updatedInvestor.toJSON() });
        res.json(updatedInvestor.toJSON());
    } catch (error) {
        next(error);
    }
};

export const deleteInvestor = async (req, res, next) => {
    try {
        await Investor.findByIdAndDelete(req.params.id);
        broadcast({ type: 'INVESTOR_DELETED', data: req.params.id });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const addInvestorPayment = async (req, res, next) => {
    const { investorId } = req.params;
    try {
        const investor = await Investor.findById(investorId);
        if (!investor) return res.status(404).json({ message: 'Investor not found' });
        
        investor.payments.push({ ...req.body, user_id: req.user.id });
        await investor.save();
        broadcast({ type: 'INVESTOR_UPDATED', data: investor.toJSON() });
        res.status(201).json(investor.toJSON());
    } catch (error) {
        next(error);
    }
};

export const updateInvestorPayment = async (req, res, next) => {
    const { investorId, paymentId } = req.params;
    try {
        const investor = await Investor.findById(investorId);
        if (!investor) return res.status(404).json({ message: 'Investor not found' });

        const payment = investor.payments.id(paymentId);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        payment.set(req.body);
        await investor.save();
        broadcast({ type: 'INVESTOR_UPDATED', data: investor.toJSON() });
        res.json(investor.toJSON());
    } catch (error) {
        next(error);
    }
};

export const deleteInvestorPayment = async (req, res, next) => {
    const { investorId, paymentId } = req.params;
    try {
        const investor = await Investor.findById(investorId);
        if (!investor) return res.status(404).json({ message: 'Investor not found' });
        
        investor.payments.pull(paymentId);
        await investor.save();
        broadcast({ type: 'INVESTOR_UPDATED', data: investor.toJSON() });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};