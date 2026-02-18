
import React, { useState } from 'react';
import { useInvestors } from '../contexts/InvestorContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { Investor, PaymentType } from '../types';
import { X, DollarSign, Calendar, MessageSquare, Check, Loader2 } from 'lucide-react';
import { sanitize } from '../utils/sanitizer';

interface InvestorPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: Investor;
}

const InvestorPaymentModal: React.FC<InvestorPaymentModalProps> = ({ isOpen, onClose, investor }) => {
  const { addInvestorPayment } = useInvestors();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payment_type, setPaymentType] = useState<PaymentType>('Profit');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Await the payment record to ensure background refresh completes
      await addInvestorPayment(investor.id, { 
        amount: paymentAmount, 
        payment_date: date, 
        payment_type, 
        remarks 
      });
      showToast(t('Payment logged successfully!'), 'success');
      onClose(); // Only close after data is updated
    } catch (err) {
      // Error handled by context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary">{t('Record Investor Payment')} for {sanitize(investor.name)}</h2>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            <InputField icon={DollarSign} label={t('Payment Amount (₹)')} type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" step="0.01" disabled={isSubmitting} />
            <InputField icon={Calendar} label={t('Payment Date')} type="date" value={date} onChange={e => setDate(e.target.value)} required disabled={isSubmitting} />
            <SelectField icon={Check} label={t('Payment Type')} value={payment_type} onChange={e => setPaymentType(e.target.value as PaymentType)} disabled={isSubmitting}>
                <option value="Profit">{t('Profit')}</option>
                <option value="Interest">{t('Interest')}</option>
                <option value="Principal">{t('Principal')}</option>
            </SelectField>
            <InputField icon={MessageSquare} label={t('Remarks (optional)')} value={remarks} onChange={e => setRemarks(e.target.value)} disabled={isSubmitting} />
            <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>{t('Cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                    {t('Log Payment')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ icon: Icon, label, ...props }: { icon: React.ComponentType<any>; label: string } & React.ComponentProps<'input'>) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Icon size={14}/>{label}</label>
    <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50" />
  </div>
);

const SelectField = ({ icon: Icon, label, children, ...props }: { icon: React.ComponentType<any>; label: string, children: React.ReactNode } & React.ComponentProps<'select'>) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Icon size={14}/>{label}</label>
      <select {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white disabled:opacity-50">
        {children}
      </select>
    </div>
);

export default InvestorPaymentModal;
