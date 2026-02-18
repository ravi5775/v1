import express from 'express';
import {
    getNotifications,
    createNotifications,
    markAsRead,
    markAllAsRead,
} from '../controllers/notificationController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getNotifications)
    .post(protect, createNotifications);

router.put('/read-all', protect, markAllAsRead);

router.route('/:id/read')
    .put(protect, markAsRead);

export default router;
