import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    payment_date: { type: Date, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

transactionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    if (returnedObject.payment_date) {
        returnedObject.payment_date = returnedObject.payment_date.toISOString();
    }
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const loanSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    loanType: { type: String, required: true, enum: ['Finance', 'Tender', 'InterestRate'] },
    loanAmount: { type: Number, required: true },
    givenAmount: { type: Number, required: true },
    interestRate: { type: Number },
    durationInMonths: { type: Number },
    durationInDays: { type: Number },
    startDate: { type: Date, required: true },
    
    // New optional fields for InterestRate loan duration
    durationValue: { type: Number, default: null },
    durationUnit: { type: String, enum: ['Months', 'Weeks', 'Days'], default: null },

    status: { type: String, required: true, enum: ['Active', 'Completed', 'Overdue'], default: 'Active' },
    transactions: [transactionSchema]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

loanSchema.set('toJSON', {
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

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;