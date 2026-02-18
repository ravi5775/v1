// types.ts

export type Language = 'en' | 'te';

export interface Admin {
  id: string; // This will now be the Supabase auth user ID (UUID)
  username: string; // This will be the user's email
}

export interface Notification {
  id: string;
  user_id: string;
  loan_id: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  loan_id: string; // Foreign key
  user_id: string;
  amount: number;
  payment_date: string;
  created_at?: string;
}

export type LoanType = 'Finance' | 'Tender' | 'InterestRate';
export type DurationUnit = 'Months' | 'Weeks' | 'Days';

export interface Loan {
  id: string;
  user_id: string; // Foreign key to auth.users
  customerName: string;
  phone: string;
  loanType: LoanType;
  
  // Flattened details from DB
  loanAmount: number;
  givenAmount: number;
  interestRate: number | null;
  durationInMonths: number | null;
  durationInDays: number | null;
  startDate: string;

  // New duration fields for InterestRate loans
  durationValue: number | null;
  durationUnit: DurationUnit | null;

  status: 'Active' | 'Completed' | 'Overdue'; // From DB

  transactions: Transaction[];
  created_at: string;
  updated_at: string;
}


// --- Investor Types ---
export type InvestmentType = 'Finance' | 'Tender' | 'InterestRatePlan';
// The DB check constraint is ('On Track', 'Delayed', 'Closed'). 'Closed' is an application state.
export type InvestorStatus = 'On Track' | 'Delayed' | 'Closed';
export type PaymentType = 'Principal' | 'Profit' | 'Interest';

export interface InvestorPayment {
  id: string;
  investor_id: string; // Foreign key
  user_id: string;
  amount: number;
  payment_date: string;
  payment_type: PaymentType;
  remarks?: string;
  created_at?: string;
}

export interface Investor {
  id: string;
  user_id: string; // Foreign key to auth.users
  name: string; // Corresponds to investor_name in DB
  investmentAmount: number; // Corresponds to invested_amount
  investmentType: InvestmentType;
  profitRate: number; // Corresponds to profit_rate
  startDate: string;
  status: InvestorStatus;
  payments: InvestorPayment[];
  created_at: string;
  updated_at: string;
}

// New type for Login History
export interface LoginHistory {
  id: string;
  user: {
    id: string;
    email: string;
  } | null;
  ip: string;
  userAgent: string;
  timestamp: string;
}