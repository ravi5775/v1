import React, { useMemo } from 'react';
import { Loan, LoanType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateLoanProfit, calculateAmountPaid } from '../utils/planCalculations';
import SimpleBarGraph from './SimpleBarGraph';

interface LoanTypeSummaryProps {
  loans: Loan[];
  loanType: LoanType;
}

const LoanTypeSummary: React.FC<LoanTypeSummaryProps> = ({ loans, loanType }) => {
  const { t } = useLanguage();

  const summary = useMemo(() => {
    return loans.reduce(
      (acc, loan) => {
        acc.totalProfit += calculateLoanProfit(loan);
        acc.totalPrincipal += loan.loanAmount;
        acc.totalGiven += loan.givenAmount;
        acc.totalCollected += calculateAmountPaid(loan.transactions);
        return acc;
      },
      { totalProfit: 0, totalPrincipal: 0, totalGiven: 0, totalCollected: 0 }
    );
  }, [loans]);

  const graphData = [
    { label: t('Total Given'), value: summary.totalGiven, color: 'bg-yellow-500' },
    { label: t('Total Collected'), value: summary.totalCollected, color: 'bg-blue-500' },
    { label: t('Total Profit'), value: summary.totalProfit, color: 'bg-green-500' },
  ];

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50 animate-fade-in-fast">
      <h3 className="text-lg font-bold text-gray-700 mb-4">
        {t('Summary for')} <span className="text-primary">{t(loanType)}</span> {t('Loans')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Metrics */}
        <div className="space-y-3">
            <Metric title={t('Total Profit')} value={summary.totalProfit} />
            <Metric title={t('Total Principal')} value={summary.totalPrincipal} />
            <Metric title={t('Total Given')} value={summary.totalGiven} />
        </div>
        
        {/* Graph */}
        <div>
          <h4 className="font-semibold text-gray-600 mb-2">{t('Financials')}</h4>
          <SimpleBarGraph data={graphData} />
        </div>
      </div>
    </div>
  );
};

interface MetricProps {
    title: string;
    value: number;
}
const Metric: React.FC<MetricProps> = ({ title, value }) => (
    <div className="flex justify-between items-baseline p-2 bg-white rounded border">
        <span className="text-sm text-gray-600">{title}:</span>
        <span className="text-md font-bold text-gray-800">
            ₹{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
    </div>
);


export default LoanTypeSummary;