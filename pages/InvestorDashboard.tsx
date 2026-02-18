
import React, { useState, useMemo } from 'react';
import { useInvestors } from '../contexts/InvestorContext';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateInvestorSummary } from '../utils/investorCalculations';
import { Users, BarChart2, TrendingUp, TrendingDown, Plus, IndianRupee } from 'lucide-react';
import InvestorForm from '../components/InvestorForm';
import InvestorsTable from '../components/InvestorsTable';
import SummaryCard from '../components/SummaryCard';

const InvestorDashboard: React.FC = () => {
  const { investors, isLoading } = useInvestors();
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const summary = useMemo(() => calculateInvestorSummary(investors), [investors]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const overallProfitLossColor = summary.overallProfitLoss >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">{t('Investor Payment Dashboard')}</h1>
        <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
          <Plus size={18} className="mr-2" />
          {t('Add New Investor')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SummaryCard icon={Users} title={t('Total Investors')} value={summary.totalInvestors} />
        <SummaryCard icon={IndianRupee} title={t('Total Investment Amount')} value={summary.totalInvestment} isCurrency />
        <SummaryCard icon={TrendingUp} title={t('Total Profit Earned')} value={summary.totalProfitEarned} isCurrency />
        <SummaryCard icon={BarChart2} title={t('Total Paid to Investors')} value={summary.totalPaidToInvestors} isCurrency />
        <SummaryCard icon={TrendingDown} title={t('Total Pending Profit')} value={summary.totalPendingProfit} isCurrency />
        <SummaryCard icon={BarChart2} title={t('Overall Profit/Loss')} value={summary.overallProfitLoss} isCurrency color={overallProfitLossColor} />
      </div>

      {/* Investors Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <InvestorsTable />
      </div>

      {isFormOpen && (
        <InvestorForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default InvestorDashboard;
