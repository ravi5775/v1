import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const initAdminUser = async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

    try {
        const userExists = await User.findOne({ email: adminEmail });

        if (!userExists) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(adminPassword, salt);

            await User.create({
                email: adminEmail,
                password_hash: passwordHash,
                full_name: 'Administrator'
            });
            console.log('Default admin user created successfully.');
        } else {
            console.log('Default admin user already exists.');
        }
    } catch (error) {
        console.error('Error during admin user initialization:', error);
    }
};