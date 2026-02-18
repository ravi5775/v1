import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import RepaymentCard from '../components/RepaymentCard';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const RepaymentPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
       <Link to="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline mb-4">
          <ChevronLeft size={16} className="mr-1" />
          {t('Back to Dashboard')}
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-800">{t('Log Repayments')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RepaymentCard 
          title={t('Finance Payments')}
          loanType="Finance"
        />
        <RepaymentCard 
          title={t('Tender Payments')}
          loanType="Tender"
        />
        <RepaymentCard 
          title={t('Interest Rate Payments')}
          loanType="InterestRate"
        />
      </div>
    </div>
  );
};

export default RepaymentPage;