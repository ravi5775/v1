
import React, { useState, useMemo } from 'react';
import { Loan } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useLoans } from '../contexts/LoanContext';
import { useNavigate } from 'react-router-dom';
import { calculateBalance, getLoanStatus, calculateLoanProfit, calculateNextDueDate } from '../utils/planCalculations';
import { Eye, Edit, Trash2 } from 'lucide-react';
import PaymentModal from './PaymentModal';
import ConfirmationModal from './ConfirmationModal';
import { sanitize } from '../utils/sanitizer';

interface LoansTableProps {
  loans: Loan[];
}

const LoansTable: React.FC<LoansTableProps> = ({ loans }) => {
  const { t } = useLanguage();
  const { deleteMultipleLoans } = useLoans();
  const navigate = useNavigate();
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = new Set(loans.map(loan => loan.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (loanId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(loanId)) {
      newSelectedIds.delete(loanId);
    } else {
      newSelectedIds.add(loanId);
    }
    setSelectedIds(newSelectedIds);
  };
  
  const handleDeleteSelected = () => {
    if (selectedIds.size > 0) {
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteMultipleLoans(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsDeleteConfirmOpen(false);
  };

  const getRowHighlightClass = (loan: Loan): string => {
    const status = getLoanStatus(loan);
    if (status === 'Completed') return 'bg-status-active/5';
    if (status === 'Overdue') return 'bg-status-overdue/5';
    const nextDueDate = calculateNextDueDate(loan);
    if (nextDueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        nextDueDate.setHours(0, 0, 0, 0);
        if (nextDueDate.getTime() === today.getTime()) return 'bg-accent/10';
    }
    return '';
  };

  const numSelected = selectedIds.size;
  const numLoans = loans.length;
  const selectedText = numSelected > 1 ? t('loans selected') : t('loan selected');

  return (
    <>
      {numSelected > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between animate-fade-in-fast border border-blue-200">
          <span className="text-sm font-semibold text-primary">
            {numSelected} {selectedText}
          </span>
          <button onClick={handleDeleteSelected} className="btn bg-status-overdue hover:opacity-90 text-white">
            <Trash2 size={16} className="mr-2" />
            {t('Delete Selected')}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-header-bg text-secondary">
            <tr>
              <th scope="col" className="px-6 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary border-gray-500 rounded focus:ring-primary bg-transparent"
                  onChange={handleSelectAll}
                  checked={numLoans > 0 && numSelected === numLoans}
                  ref={input => {
                    if (input) input.indeterminate = numSelected > 0 && numSelected < numLoans;
                  }}
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('Customer Name')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('Loan Type')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('Status')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('Next Due Date')}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">{t('Balance Due')}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">{t('Profit')}</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loans.map((loan) => (
              <tr key={loan.id} className={`${getRowHighlightClass(loan)} ${selectedIds.has(loan.id) ? 'bg-blue-100' : 'hover:bg-gray-50'} transition-colors duration-200`}>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={selectedIds.has(loan.id)}
                    onChange={() => handleSelectOne(loan.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{sanitize(loan.customerName)}</div>
                  <div className="text-sm text-gray-500">{sanitize(loan.phone)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t(loan.loanType)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getLoanStatus(loan) === 'Completed' ? 'bg-status-active/10 text-status-active' :
                      getLoanStatus(loan) === 'Overdue' ? 'bg-status-overdue/10 text-status-overdue' :
                      'bg-highlight/10 text-highlight'
                  }`}>
                    {t(getLoanStatus(loan))}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {calculateNextDueDate(loan)?.toLocaleDateString() ?? 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-mono">₹{calculateBalance(loan).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-mono">₹{calculateLoanProfit(loan).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => setSelectedLoan(loan)} className="p-2 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100" title={t('View/Pay')}><Eye size={20} /></button>
                    <button onClick={() => navigate(`/loan/edit/${loan.id}`)} className="p-2 rounded-full text-green-600 hover:text-green-900 hover:bg-green-100" title={t('Edit')}><Edit size={20} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loans.length === 0 && <p className="text-center text-gray-500 py-8">{t('No loans found.')}</p>}
      {selectedLoan && <PaymentModal loanId={selectedLoan.id} onClose={() => setSelectedLoan(null)} />}
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('Confirm Deletion')}
        variant="danger"
      >
        <p>
            {t('Are you sure you want to delete')} {selectedIds.size} {selectedIds.size > 1 ? t('loans') : t('loan')}?
        </p>
        <p className="mt-2 text-sm text-gray-500">
            {t('This action cannot be undone.')}
        </p>
      </ConfirmationModal>
    </>
  );
};

export default LoansTable;
