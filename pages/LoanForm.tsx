
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLoans } from '../contexts/LoanContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { Loan, LoanType, DurationUnit } from '../types';
import { ChevronLeft, User, DollarSign, Percent, FileText, Clock } from 'lucide-react';

const LoanForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addLoan, updateLoan, getLoanById } = useLoans();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const isEditing = !!id;
  const loanToEdit = useMemo(() => isEditing ? getLoanById(id) : undefined, [id, getLoanById, isEditing]);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [loanType, setLoanType] = useState<LoanType | ''>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loanAmount, setLoanAmount] = useState(0);
  const [givenAmount, setGivenAmount] = useState(0);
  const [interestRate, setInterestRate] = useState<number | null>(2);
  const [durationInMonths, setDurationInMonths] = useState<number | null>(1);
  const [durationInDays, setDurationInDays] = useState<number | null>(1);

  // New state for InterestRate duration
  const [durationValue, setDurationValue] = useState<number | null>(12);
  const [durationUnit, setDurationUnit] = useState<DurationUnit | null>('Months');
  
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    if (isEditing && loanToEdit) {
      setCustomerName(loanToEdit.customerName);
      setPhone(loanToEdit.phone);
      setLoanType(loanToEdit.loanType);
      setStartDate(new Date(loanToEdit.startDate).toISOString().split('T')[0]);
      
      setLoanAmount(loanToEdit.loanAmount);
      setGivenAmount(loanToEdit.givenAmount);
      setInterestRate(loanToEdit.interestRate);
      setDurationInMonths(loanToEdit.durationInMonths);
      setDurationInDays(loanToEdit.durationInDays);

      // Populate new fields
      setDurationValue(loanToEdit.durationValue);
      setDurationUnit(loanToEdit.durationUnit);
    }
  }, [isEditing, loanToEdit]);

  // Reset form to defaults when loan type changes to prevent carrying over old data
  useEffect(() => {
    if (isEditing) return; 

    setLoanAmount(0);
    setGivenAmount(0);
    setInterestRate(2);
    setDurationInMonths(1);
    setDurationInDays(1);
    setDurationValue(12);
    setDurationUnit('Months');
    
  }, [loanType, isEditing]);
  
  const validateForm = (): boolean => {
    setFormError('');
    if (loanType === 'Tender' && givenAmount >= loanAmount) {
      setFormError('Given amount must be less than the amount to be repaid.');
      return false;
    }
    // Allow givenAmount to be equal to loanAmount for these types
    if ((loanType === 'Finance' || loanType === 'InterestRate') && givenAmount > loanAmount && givenAmount > 0) {
      setFormError('Given amount cannot be greater than the Loan Amount.');
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!loanType) {
      showToast('Please select a loan type.', 'error');
      return;
    }

    let finalGivenAmount = givenAmount;
    if ((loanType === 'Finance' || loanType === 'InterestRate') && (!givenAmount || givenAmount <= 0)) {
        finalGivenAmount = loanAmount;
    }

    const loanData: Partial<Loan> = {
        customerName,
        phone,
        loanType,
        startDate,
        loanAmount,
        givenAmount: finalGivenAmount,
        interestRate: loanType === 'Finance' || loanType === 'InterestRate' ? interestRate : null,
        durationInMonths: loanType === 'Finance' ? durationInMonths : null,
        durationInDays: loanType === 'Tender' ? durationInDays : null,
        durationValue: loanType === 'InterestRate' ? durationValue : null,
        durationUnit: loanType === 'InterestRate' ? durationUnit : null,
    };

    try {
      if (isEditing && loanToEdit) {
        await updateLoan({ ...loanToEdit, ...loanData });
      } else {
        await addLoan(loanData);
      }
      showToast(t('Loan saved successfully!'), 'success');
      navigate('/');
    } catch (error) {
      console.error(error);
      showToast(t('Failed to save loan.'), 'error');
    }
  };

  const totalFinanceAmount = useMemo(() => {
    const monthlyInterest = (loanAmount || 0) * ((interestRate || 0) / 100);
    const totalInterest = monthlyInterest * (durationInMonths || 0);
    return (loanAmount || 0) + totalInterest;
  }, [loanAmount, interestRate, durationInMonths]);
  
  const totalFinanceProfit = useMemo(() => {
    const effectiveGiven = givenAmount > 0 ? givenAmount : loanAmount;
    return totalFinanceAmount - effectiveGiven;
  }, [totalFinanceAmount, givenAmount, loanAmount]);

  const totalTenderProfit = useMemo(() => (loanAmount || 0) - (givenAmount || 0), [loanAmount, givenAmount]);
  const firstMonthInterest = useMemo(() => ((loanAmount || 0) * (interestRate || 0) / 100), [loanAmount, interestRate]);

  const inputFieldClass = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";
  const selectFieldClass = `${inputFieldClass} bg-white`;

  return (
    <div className="max-w-4xl mx-auto">
       <Link to="/" className="inline-flex items-center text-sm font-medium text-primary hover:underline mb-4">
          <ChevronLeft size={16} className="mr-1" />
          {t('Back to Dashboard')}
       </Link>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-sm space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{isEditing ? t('Edit Loan') : t('Create New Loan')}</h1>
        
        {formError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p>{formError}</p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 flex items-center gap-2"><User />{t('Customer Information')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label={t('Customer Name')} id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required className={inputFieldClass} />
            <InputField label={t('Phone (optional)')} id="phone" value={phone} onChange={e => setPhone(e.target.value)} type="tel" className={inputFieldClass} />
          </div>
        </div>
        
        <div className="space-y-2">
            <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 flex items-center gap-2"><FileText />{t('Select Loan Type')}</label>
            <select id="loanType" value={loanType} onChange={e => setLoanType(e.target.value as LoanType | '')} required className={selectFieldClass} disabled={isEditing}>
                <option value="" disabled>{t('-- Choose a loan type --')}</option>
                <option value="Finance">{t('Finance')}</option>
                <option value="Tender">{t('Tender')}</option>
                <option value="InterestRate">{t('InterestRate')}</option>
            </select>
        </div>

        {loanType === 'Finance' && (
          <div className="space-y-4 pt-4 border-t animate-fade-in-fast">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2"><DollarSign />{t('Finance Details')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label={t('Loan Amount')} id="loanAmount" type="number" value={loanAmount || ''} onChange={e => setLoanAmount(+e.target.value)} required min="1" className={inputFieldClass} />
                <InputField label={t('Given Amount (Disbursed)')} id="givenAmountFinance" type="number" value={givenAmount || ''} onChange={e => setGivenAmount(+e.target.value)} min="0" className={inputFieldClass} />
                <InputField label={t('Duration (Months)')} id="durationMonths" type="number" value={durationInMonths || ''} onChange={e => setDurationInMonths(+e.target.value)} required min="1" className={inputFieldClass} />
                <InputField label={t('Interest Rate (₹ per ₹100 per Month)')} id="interestRatePerMonth" type="number" value={interestRate || ''} onChange={e => setInterestRate(+e.target.value)} required min="0" step="0.01" className={inputFieldClass} />
                <InputField label={t('Start Date')} id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className={inputFieldClass} />
                 <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                        <p className="text-sm text-gray-600">{t('Total Amount to be Paid')}</p>
                        <p className="text-lg font-bold text-primary">₹{totalFinanceAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md text-center">
                        <p className="text-sm text-gray-600">{t('Profit')}</p>
                        <p className="text-lg font-bold text-primary">₹{totalFinanceProfit.toLocaleString('en-IN')}</p>
                    </div>
                 </div>
            </div>
          </div>
        )}

        {loanType === 'Tender' && (
             <div className="space-y-4 pt-4 border-t animate-fade-in-fast">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2"><FileText />{t('Tender Details')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={t('Loan Amount (To be Repaid)')} id="tenderLoanAmount" type="number" value={loanAmount || ''} onChange={e => setLoanAmount(+e.target.value)} required min="1" className={inputFieldClass} />
                    <InputField label={t('Given Amount (Disbursed)')} id="givenAmount" type="number" value={givenAmount || ''} onChange={e => setGivenAmount(+e.target.value)} required min="0" className={inputFieldClass} />
                    <InputField label={t('Duration (Days)')} id="duration" type="number" value={durationInDays || ''} onChange={e => setDurationInDays(+e.target.value)} required min="1" className={inputFieldClass} />
                    <InputField label={t('Start Date')} id="startDateTender" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className={inputFieldClass} />
                    <div className="md:col-span-2 p-3 bg-gray-50 rounded-md text-center">
                       <p className="text-sm text-gray-600">{t('Profit')}</p>
                       <p className="text-lg font-bold text-primary">₹{totalTenderProfit.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>
        )}
        
        {loanType === 'InterestRate' && (
            <div className="space-y-4 pt-4 border-t animate-fade-in-fast">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2"><Percent />{t('Interest Details')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={t('Principal Amount')} id="principalAmount" type="number" value={loanAmount || ''} onChange={e => setLoanAmount(+e.target.value)} required min="1" className={inputFieldClass} />
                    <InputField label={t('Given Amount (Disbursed)')} id="givenAmountInterest" type="number" value={givenAmount || ''} onChange={e => setGivenAmount(+e.target.value)} min="0" className={inputFieldClass} />
                    <InputField label={t('Interest Rate (₹ per ₹100 per Month)')} id="interestRatePerMonth" type="number" value={interestRate || ''} onChange={e => setInterestRate(+e.target.value)} required min="0" step="0.01" className={inputFieldClass} />
                    <InputField label={t('Start Date')} id="startDateInterest" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className={inputFieldClass} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <InputField icon={Clock} label={t('Duration')} id="durationValue" type="number" value={durationValue || ''} onChange={e => setDurationValue(+e.target.value)} min="1" className={inputFieldClass} />
                    <div>
                        <label htmlFor="durationUnit" className="block text-sm font-medium text-gray-700 mb-1">{t('Duration Unit')}</label>
                        <select id="durationUnit" value={durationUnit || ''} onChange={e => setDurationUnit(e.target.value as DurationUnit | null)} className={selectFieldClass}>
                            <option value="Months">{t('Months')}</option>
                            <option value="Weeks">{t('Weeks')}</option>
                            <option value="Days">{t('Days')}</option>
                        </select>
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md text-center mt-4">
                    <p className="text-sm text-gray-600">{t("First Month's Interest")}</p>
                    <p className="text-lg font-bold text-primary">₹{firstMonthInterest.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">{t("Total amount due will change based on payments.")}</p>
                 </div>
            </div>
        )}

        {loanType && (
            <div className="pt-6 border-t">
                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                    {isEditing ? t('Update Loan') : t('Save Loan')}
                </button>
            </div>
        )}
      </form>
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    icon?: React.ComponentType<any>;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, icon: Icon, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            {Icon && <Icon size={14} />}
            {label}
        </label>
        <input id={id} {...props} />
    </div>
);

export default LoanForm;
