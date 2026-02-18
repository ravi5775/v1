
import React, { useState, useMemo } from 'react';
import { Loan, LoanType } from '../types';
import { useLoans } from '../contexts/LoanContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { calculateBalance, getLoanStatus } from '../utils/planCalculations';
import { Search, DollarSign, User, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { sanitize } from '../utils/sanitizer';

interface RepaymentCardProps {
  title: string;
  loanType: LoanType;
}

const RepaymentCard: React.FC<RepaymentCardProps> = ({ title, loanType }) => {
  const { t } = useLanguage();
  const { loans, addTransaction } = useLoans();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeLoans = useMemo(() => {
    return loans.filter(loan => 
      loan.loanType === loanType && getLoanStatus(loan) !== 'Completed'
    ).sort((a, b) => a.customerName.localeCompare(b.customerName));
  }, [loans, loanType]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const lowercasedSearch = searchTerm.toLowerCase().trim();
    if (!lowercasedSearch) return [];
    return activeLoans.filter(loan => 
      loan.customerName.toLowerCase().includes(lowercasedSearch) ||
      loan.phone.includes(searchTerm.trim())
    ).slice(0, 5);
  }, [searchTerm, activeLoans]);

  const handleSelectLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setSearchTerm(loan.customerName);
  };
  
  const handleReset = () => {
    setSearchTerm('');
    setSelectedLoan(null);
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  }

  const handleSelectLoanFromDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loanId = e.target.value;
    if (loanId) {
        const loan = activeLoans.find(l => l.id === loanId);
        if (loan) {
            handleSelectLoan(loan);
        }
    } else {
        handleReset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan || !amount) {
      showToast('Please select a loan and enter an amount.', 'error');
      return;
    }
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      showToast('Please enter a valid positive amount.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // We await the transaction addition, which now includes a fetchLoans(true) internally.
      await addTransaction(selectedLoan.id, {
          amount: paymentAmount,
          payment_date: new Date(date).toISOString(),
      });
      showToast(`Payment of ₹${paymentAmount.toLocaleString('en-IN')} logged for ${selectedLoan.customerName}.`, 'success');
      handleReset(); // UI resets only after data is confirmed fresh
    } catch (err) {
      // Error handled by context toast
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const balance = selectedLoan ? calculateBalance(selectedLoan) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <label htmlFor={`search-${loanType}`} className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><User size={14}/>{t('Search for a Customer')}</label>
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 left-3 w-5 h-5 text-gray-400" />
            <input
              id={`search-${loanType}`}
              type="text"
              placeholder={t('Search by name or phone...')}
              value={searchTerm}
              onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if(selectedLoan && e.target.value !== selectedLoan.customerName) {
                      setSelectedLoan(null);
                  }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              autoComplete="off"
            />
          </div>
          {searchTerm && searchResults.length > 0 && !selectedLoan && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {searchResults.map(loan => (
                <li 
                  key={loan.id} 
                  onClick={() => handleSelectLoan(loan)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {sanitize(loan.customerName)} ({sanitize(loan.phone)})
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-center my-1 text-sm text-gray-500">OR</div>

        {/* Dropdown Select */}
        <div>
          <label htmlFor={`select-${loanType}`} className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><User size={14}/>{t('Select a Customer')}</label>
          <select
            id={`select-${loanType}`}
            value={selectedLoan ? selectedLoan.id : ''}
            onChange={handleSelectLoanFromDropdown}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white"
          >
            <option value="">{t('-- Select a loan --')}</option>
            {activeLoans.map(loan => (
              <option key={loan.id} value={loan.id}>
                {sanitize(loan.customerName)} ({sanitize(loan.phone)}) - Bal: ₹{calculateBalance(loan).toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </div>

        {selectedLoan && (
            <div className='p-3 bg-primary/5 rounded-md border border-primary/20 animate-fade-in-fast'>
                <p className="text-sm font-semibold text-primary">{sanitize(selectedLoan.customerName)}</p>
                <p className="text-xs text-gray-600">Balance: ₹{balance.toLocaleString('en-IN')}</p>
            </div>
        )}

        <div>
           <label htmlFor={`amount-${loanType}`} className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><DollarSign size={14}/>{t('Amount')}</label>
           <input
              id={`amount-${loanType}`}
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder='0.00'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={!selectedLoan || isSubmitting}
              min="1"
              step="0.01"
           />
           {selectedLoan && parseFloat(amount) > balance && (
                <p className="text-xs text-yellow-600 mt-1">Note: Amount is greater than balance.</p>
           )}
        </div>
        
         <div>
           <label htmlFor={`date-${loanType}`} className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Calendar size={14}/>{t('Date')}</label>
           <input
              id={`date-${loanType}`}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={!selectedLoan || isSubmitting}
           />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={!selectedLoan || !amount || isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle size={16} className="mr-2"/>}
          {t('Log Payment')}
        </button>
      </form>
    </div>
  );
};

export default RepaymentCard;
