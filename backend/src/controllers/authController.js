import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import LoginHistory from '../models/LoginHistory.js';

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // --- Log successful login ---
        try {
            await LoginHistory.create({
                user: user._id,
                ip: req.ip,
                userAgent: req.headers['user-agent'] || 'N/A',
            });
        } catch (logError) {
            console.error("Failed to record login history:", logError);
            // Non-fatal error, so we don't block the login process.
        }
        // -------------------------

        const payload = {
            id: user.id,
            email: user.email,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                username: user.email,
            },
        });

    } catch (error) {
        next(error);
    }
};