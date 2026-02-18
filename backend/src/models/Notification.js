import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    loan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', default: null },
    title: { type: String, required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

notificationSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        if (returnedObject.loan_id) {
            returnedObject.loan_id = returnedObject.loan_id.toString();
        }
        if (returnedObject.created_at) {
            returnedObject.created_at = returnedObject.created_at.toISOString();
        }
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
