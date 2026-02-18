import mongoose from 'mongoose';

const investorPaymentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    payment_date: { type: Date, required: true },
    payment_type: { type: String, required: true, enum: ['Principal', 'Profit', 'Interest'] },
    remarks: { type: String, trim: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

investorPaymentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        if (returnedObject.payment_date) {
            returnedObject.payment_date = returnedObject.payment_date.toISOString();
        }
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const investorSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    investmentAmount: { type: Number, required: true },
    investmentType: { type: String, required: true, enum: ['Finance', 'Tender', 'InterestRatePlan'] },
    profitRate: { type: Number, required: true },
    startDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ['On Track', 'Delayed', 'Closed'], default: 'On Track' },
    payments: [investorPaymentSchema],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

investorSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        if (returnedObject.startDate) {
            returnedObject.startDate = returnedObject.startDate.toISOString();
        }
        if (returnedObject.created_at) {
            returnedObject.created_at = returnedObject.created_at.toISOString();
        }
        if (returnedObject.updated_at) {
            returnedObject.updated_at = returnedObject.updated_at.toISOString();
        }
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

const Investor = mongoose.model('Investor', investorSchema);
export default Investor;
