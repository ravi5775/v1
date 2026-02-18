import React, { useState, useMemo } from 'react';
import { useLoans } from '../contexts/LoanContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import LoansTable from '../components/LoansTable';
import SummaryCard from '../components/SummaryCard';
import LoanTypeSummary from '../components/LoanTypeSummary';
import { generateCSV } from '../utils/csvUtils';
import { Plus, Download, Search, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { calculateLoanProfit, calculateAmountPaid, calculateBalance } from '../utils/planCalculations';
import { LoanType } from '../types';

const AdminDashboard: React.FC = () => {
  const { loans, isLoading } = useLoans();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | LoanType>('All');

  const filteredLoans = useMemo(() => {
    let loansToFilter = loans;

    if (activeFilter !== 'All') {
        loansToFilter = loans.filter(loan => loan.loanType === activeFilter);
    }
    
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      return loansToFilter;
    }
    const lowercasedSearch = trimmedSearch.toLowerCase();

    return loansToFilter.filter(loan => {
      const nameMatch = loan.customerName.trim().toLowerCase().includes(lowercasedSearch);
      const phoneMatch = loan.phone ? loan.phone.includes(trimmedSearch) : false;
      return nameMatch || phoneMatch;
    });
  }, [loans, searchTerm, activeFilter]);

  const overallSummary = useMemo(() => {
    let totalProfit = 0;
    let totalCollected = 0;
    let totalPending = 0;

    loans.forEach(loan => {
        totalProfit += calculateLoanProfit(loan);
        totalCollected += calculateAmountPaid(loan.transactions);
        totalPending += calculateBalance(loan);
    });

    return { totalProfit, totalCollected, totalPending };
  }, [loans]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  const filterButtons: Array<'All' | LoanType> = ['All', 'Finance', 'Tender', 'InterestRate'];

  return (
    <div className="space-y-6">
      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard icon={TrendingUp} title={t('Total Expected Profit')} value={overallSummary.totalProfit} isCurrency />
        <SummaryCard icon={IndianRupee} title={t('Total Collected')} value={overallSummary.totalCollected} isCurrency />
        <SummaryCard icon={TrendingDown} title={t('Total Pending')} value={overallSummary.totalPending} isCurrency color="text-red-600" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('All Loans')}</h2>
          <div className="flex items-center gap-2">
              <button
                  onClick={() => navigate('/loan/new')}
                  className="btn btn-primary"
              >
                  <Plus size={18} className="mr-2" />
                  {t('Add New Loan')}
              </button>
              <button
                  onClick={() => generateCSV(filteredLoans, t)}
                  className="btn btn-secondary"
              >
                  <Download size={18} className="mr-2" />
                  {t('Export as CSV')}
              </button>
          </div>
        </div>
        
         {/* Filter Buttons */}
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b pb-4">
          {filterButtons.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                activeFilter === filter
                  ? 'bg-primary text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t(filter)}
            </button>
          ))}
        </div>

        {/* Loan Type Specific Summary and Graph */}
        {activeFilter !== 'All' && (
            <LoanTypeSummary loans={filteredLoans} loanType={activeFilter} />
        )}
        
        <div className="mb-4 relative">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('Search by name or phone...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <LoansTable loans={filteredLoans} />
      </div>
    </div>
  );
};

export default AdminDashboard;