
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Loan, Transaction } from '../types';
import apiService from '../utils/apiService';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';
import { useToast } from './ToastContext';

interface LoanContextType {
  loans: Loan[];
  isLoading: boolean;
  addLoan: (loanData: Partial<Loan>) => Promise<void>;
  updateLoan: (loanData: Loan) => Promise<void>;
  deleteMultipleLoans: (loanIds: string[]) => Promise<void>;
  getLoanById: (id: string) => Loan | undefined;
  addTransaction: (loanId: string, transaction: Omit<Transaction, 'id' | 'loan_id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateTransaction: (loanId: string, transaction: Transaction) => Promise<void>;
  deleteTransaction: (loanId: string, transactionId: string) => Promise<void>;
  refreshLoans: () => Promise<void>;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { subscribe, unsubscribe } = useWebSocket();
  const { showToast } = useToast();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLoans = useCallback(async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setIsLoading(true);
    try {
      const data = await apiService.getLoans();
      const sortedData = data.map(loan => ({
        ...loan,
        transactions: (loan.transactions || []).sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      }));
      setLoans(sortedData);
    } catch (error: any) {
      showToast(`Error fetching loans: ${error.message}`, 'error');
      setLoans([]);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) fetchLoans();
    else {
      setLoans([]);
      setIsLoading(false);
    }
  }, [user, fetchLoans]);

  // Real-time synchronization for changes made by other admins
  useEffect(() => {
    const handleCreated = (newLoan: Loan) => {
      setLoans(prev => [newLoan, ...prev]);
    };
    const handleUpdated = (updatedLoan: Loan) => {
      setLoans(prev => prev.map(l => l.id === updatedLoan.id ? updatedLoan : l));
    };
    const handleDeleted = (ids: string[]) => {
      setLoans(prev => prev.filter(l => !ids.includes(l.id)));
    };

    subscribe('LOAN_CREATED', handleCreated);
    subscribe('LOAN_UPDATED', handleUpdated);
    subscribe('LOANS_DELETED', handleDeleted);
    // Generic signal for multi-record changes
    subscribe('LOANS_UPDATED', () => fetchLoans(true));

    return () => {
      unsubscribe('LOAN_CREATED', handleCreated);
      unsubscribe('LOAN_UPDATED', handleUpdated);
      unsubscribe('LOANS_DELETED', handleDeleted);
      unsubscribe('LOANS_UPDATED', () => fetchLoans(true));
    };
  }, [subscribe, unsubscribe, fetchLoans]);

  const addLoan = async (loanData: Partial<Loan>) => {
    try {
      await apiService.createLoan(loanData);
      await fetchLoans(true); // Auto-refresh immediately after creation
      showToast('Loan created successfully!', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const updateLoan = async (loanData: Loan) => {
    try {
      await apiService.updateLoan(loanData.id, loanData);
      await fetchLoans(true); // Auto-refresh immediately after update
      showToast('Loan updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const deleteMultipleLoans = async (loanIds: string[]) => {
    try {
      await apiService.deleteLoans(loanIds);
      await fetchLoans(true); // Auto-refresh immediately after deletion
      showToast('Loan(s) deleted successfully!', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };
  
  const getLoanById = useCallback((id: string) => loans.find(l => l.id === id), [loans]);

  const addTransaction = async (loanId: string, transaction: Omit<Transaction, 'id' | 'loan_id' | 'user_id' | 'created_at'>) => {
    try {
      await apiService.addTransaction(loanId, transaction);
      await fetchLoans(true); // Critical: Refresh to update remaining balances instantly
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };
  
  const updateTransaction = async (loanId: string, updatedTxn: Transaction) => {
    try {
      await apiService.updateTransaction(loanId, updatedTxn.id, updatedTxn);
      await fetchLoans(true); // Refresh after transaction edit
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };
  
  const deleteTransaction = async (loanId: string, transactionId: string) => {
    try {
      await apiService.deleteTransaction(loanId, transactionId);
      await fetchLoans(true); // Refresh after transaction deletion
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };
  
  return (
    <LoanContext.Provider value={{
      loans,
      isLoading,
      addLoan,
      updateLoan,
      deleteMultipleLoans,
      getLoanById,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refreshLoans: () => fetchLoans(true)
    }}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoans = () => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoans must be used within a LoanProvider');
  }
  return context;
};
