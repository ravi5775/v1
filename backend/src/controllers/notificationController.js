import Notification from '../models/Notification.js';

// GET all notifications for all users
export const getNotifications = async (req, res, next) => {
    const { is_read } = req.query;
    // Data is shared: query is no longer user-specific.
    const query = {};

    if (is_read !== undefined) {
        query.is_read = is_read === 'true';
    }
    
    try {
        const notifications = await Notification.find(query).sort({ created_at: -1 });
        res.json(notifications.map(n => n.toJSON()));
    } catch (error) {
        next(error);
    }
};

// CREATE multiple notifications (for overdue loans)
export const createNotifications = async (req, res, next) => {
    const notificationsData = req.body;
    if (!Array.isArray(notificationsData) || notificationsData.length === 0) {
        return res.status(400).json({ message: 'Array of notifications is required' });
    }

    const notificationsWithUserId = notificationsData.map(n => ({
        ...n,
        user_id: req.user.id // Keep creator's ID for auditing
    }));

    try {
        await Notification.insertMany(notificationsWithUserId);
        res.status(201).json({ message: 'Notifications created' });
    } catch (error) {
        next(error);
    }
};


// Mark a single notification as read (globally)
export const markAsRead = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Any admin can mark any notification as read.
        await Notification.findByIdAndUpdate(id, { is_read: true });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Mark all unread notifications as read (globally)
export const markAllAsRead = async (req, res, next) => {
    try {
        // Mark all unread notifications as read, regardless of who created them.
        await Notification.updateMany(
            { is_read: false },
            { is_read: true }
        );
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};