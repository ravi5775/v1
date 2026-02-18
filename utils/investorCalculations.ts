import { Investor } from '../types';

interface InvestorMetrics {
  currentBalance: number;
  accumulatedProfit: number;
  totalPaid: number;
  missedMonths: number;
  monthlyProfit: number;
  status: 'On Track' | 'Delayed' | 'Closed';
}

export const calculateInvestorMetrics = (investor: Investor): InvestorMetrics => {
  if (investor.status === 'Closed') {
    const totalPaid = investor.payments.reduce((sum, p) => sum + p.amount, 0);
    const accumulatedProfit = Math.max(0, totalPaid - investor.investmentAmount);
    return {
      currentBalance: 0,
      accumulatedProfit,
      totalPaid,
      missedMonths: 0,
      monthlyProfit: 0,
      status: 'Closed'
    };
  }

  const startDate = new Date(investor.startDate);
  const today = new Date();

  // 1. Calculate Monthly Interest (Simple Interest based on initial principal)
  const monthlyProfit = investor.investmentAmount * (investor.profitRate / 100);

  // 2. Calculate the number of full months completed
  let monthsCompleted = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
  if (today.getDate() < startDate.getDate()) {
    monthsCompleted--;
  }
  monthsCompleted = Math.max(0, monthsCompleted);

  // 3. Calculate Total Accumulated/Accrued Profit
  const accumulatedProfit = monthlyProfit * monthsCompleted;

  // 4. Calculate Total Paid
  const totalPaid = investor.payments.reduce((sum, p) => sum + p.amount, 0);

  // 5. Calculate Pending Profit
  const pendingProfit = accumulatedProfit - totalPaid;

  // 6. Calculate Missed Months (based on how many monthly payments are covered by pending profit)
  const missedMonths = monthlyProfit > 0 ? Math.floor(Math.max(0, pendingProfit) / monthlyProfit) : 0;

  // 7. Determine Status
  let status: 'On Track' | 'Delayed' | 'Closed' = 'On Track';
  if (pendingProfit > 0.01) { // Use a small epsilon for float comparison
    status = 'Delayed';
  }

  // Current balance is the original principal plus any unpaid profit.
  const currentBalance = investor.investmentAmount + Math.max(0, pendingProfit);

  return {
    currentBalance,
    accumulatedProfit,
    totalPaid,
    missedMonths,
    monthlyProfit, // The fixed monthly profit amount
    status
  };
};


interface InvestorSummary {
  totalInvestors: number;
  totalInvestment: number;
  totalProfitEarned: number;
  totalPaidToInvestors: number;
  totalPendingProfit: number;
  overallProfitLoss: number;
}

export const calculateInvestorSummary = (investors: Investor[]): InvestorSummary => {
  const summary: InvestorSummary = {
    totalInvestors: investors.length,
    totalInvestment: 0,
    totalProfitEarned: 0,
    totalPaidToInvestors: 0,
    totalPendingProfit: 0,
    overallProfitLoss: 0,
  };

  investors.forEach(investor => {
    const metrics = calculateInvestorMetrics(investor);
    const pendingProfit = Math.max(0, metrics.accumulatedProfit - metrics.totalPaid);

    summary.totalInvestment += investor.investmentAmount;
    summary.totalPaidToInvestors += metrics.totalPaid;
    summary.totalProfitEarned += metrics.accumulatedProfit;
    summary.totalPendingProfit += pendingProfit;
  });
  
  // Overall P/L from the business perspective (total profit paid out to investors)
  summary.overallProfitLoss = summary.totalPaidToInvestors - summary.totalInvestment;

  return summary;
};