import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import LoginHistory from '../models/LoginHistory.js';
import Loan from '../models/Loan.js';
import Investor from '../models/Investor.js';
import { broadcast } from '../services/websocket.js';

// Controller to create a new admin user
export const createAdmin = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email,
            password_hash: passwordHash,
            full_name: 'Administrator',
        });

        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
        });

    } catch (error) {
        next(error);
    }
};

// Controller for the logged-in admin to change their own password
export const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        next(error);
    }
};

// Controller to get recent login history
export const getLoginHistory = async (req, res, next) => {
    try {
        const history = await LoginHistory.find({})
            .sort({ timestamp: -1 })
            .limit(50)
            .populate('user', 'email');
        
        res.json(history.map(item => item.toJSON()));
    } catch (error) {
        next(error);
    }
};

// Controller to restore data from a backup file
export const restoreBackup = async (req, res, next) => {
    const { loans, investors } = req.body;
    const adminUserId = req.user.id;

    if (!Array.isArray(loans) || !Array.isArray(investors)) {
        return res.status(400).json({ message: 'Invalid backup format. "loans" and "investors" arrays are required.' });
    }

    try {
        // Clear existing collections
        await Loan.deleteMany({});
        await Investor.deleteMany({});

        // Prepare data for insertion, ensuring user_id is set for auditing
        const cleanLoans = loans.map(({ id, ...rest }) => {
            const loanData = { ...rest, user_id: adminUserId };
            if (loanData.transactions) {
                loanData.transactions = loanData.transactions.map(({ id, ...txRest }) => ({ ...txRest, user_id: adminUserId }));
            }
            return loanData;
        });

        const cleanInvestors = investors.map(({ id, ...rest }) => {
            const investorData = { ...rest, user_id: adminUserId };
            if (investorData.payments) {
                investorData.payments = investorData.payments.map(({ id, ...pRest }) => ({ ...pRest, user_id: adminUserId }));
            }
            return investorData;
        });
        
        // Insert new data
        if (cleanLoans.length > 0) {
            await Loan.insertMany(cleanLoans, { ordered: false });
        }
        if (cleanInvestors.length > 0) {
            await Investor.insertMany(cleanInvestors, { ordered: false });
        }

        // Broadcast updates to all clients
        broadcast({ type: 'LOANS_UPDATED' });
        broadcast({ type: 'INVESTORS_UPDATED' });

        res.status(200).json({ message: 'Backup restored successfully' });

    } catch (error) {
        next(error);
    }
};