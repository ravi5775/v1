
import { body, validationResult } from 'express-validator';

/**
 * Middleware to check for validation errors and return them to the client.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array().map(err => ({ 
        field: err.path, 
        msg: err.msg 
      })) 
    });
  }
  next();
};

/**
 * Validation schemas
 */
export const authValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const adminCreateValidation = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

export const passwordChangeValidation = [
  body('oldPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
];

export const loanValidation = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required').isLength({ max: 100 }),
  body('loanType').isIn(['Finance', 'Tender', 'InterestRate']).withMessage('Invalid loan type'),
  body('loanAmount').isFloat({ min: 0.01 }).withMessage('Loan amount must be a positive number'),
  body('givenAmount').isFloat({ min: 0 }).withMessage('Given amount must be a non-negative number'),
  body('startDate').isISO8601().toDate().withMessage('Invalid start date'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
];

export const investorValidation = [
  body('name').trim().notEmpty().withMessage('Investor name is required'),
  body('investmentAmount').isFloat({ min: 0.01 }).withMessage('Investment amount must be positive'),
  body('investmentType').isIn(['Finance', 'Tender', 'InterestRatePlan']).withMessage('Invalid investment type'),
  body('profitRate').isFloat({ min: 0 }).withMessage('Profit rate cannot be negative'),
  body('startDate').isISO8601().toDate().withMessage('Invalid start date'),
];

export const transactionValidation = [
  body('amount').isFloat({ min: 0.01 }).withMessage('Transaction amount must be positive'),
  body('payment_date').isISO8601().toDate().withMessage('Invalid payment date'),
];
