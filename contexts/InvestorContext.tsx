
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Investor, InvestorPayment } from '../types';
import apiService from '../utils/apiService';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';
import { useToast } from './ToastContext';

interface InvestorContextType {
  investors: Investor[];
  isLoading: boolean;
  addInvestor: (investorData: Omit<Investor, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'payments'>) => Promise<void>;
  updateInvestor: (investorData: Investor) => Promise<void>;
  deleteInvestor: (investorId: string) => Promise<void>;
  addInvestorPayment: (investorId: string, payment: Omit<InvestorPayment, 'id' | 'investor_id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateInvestorPayment: (investorId: string, payment: InvestorPayment) => Promise<void>;
  deleteInvestorPayment: (investorId: string, paymentId: string) => Promise<void>;
  refreshInvestors: () => Promise<void>;
}

const InvestorContext = createContext<InvestorContextType | undefined>(undefined);

export const InvestorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { subscribe, unsubscribe } = useWebSocket();
  const { showToast } = useToast();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvestors = useCallback(async (isSilent = false) => {
    if (!user) return;
    if (!isSilent) setIsLoading(true);
    try {
        const data = await apiService.getInvestors();
        setInvestors(data);
    } catch (error: any) {
        showToast(`Error fetching investors: ${error.message}`, 'error');
        setInvestors([]);
    } finally {
        if (!isSilent) setIsLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (user) fetchInvestors();
    else {
      setInvestors([]);
      setIsLoading(false);
    }
  }, [user, fetchInvestors]);

  // Multi-device sync
  useEffect(() => {
    const handleCreated = (newInv: Investor) => {
      setInvestors(prev => [newInv, ...prev]);
    };
    const handleUpdated = (updatedInv: Investor) => {
      setInvestors(prev => prev.map(inv => inv.id === updatedInv.id ? updatedInv : inv));
    };
    const handleDeleted = (id: string) => {
      setInvestors(prev => prev.filter(inv => inv.id !== id));
    };

    subscribe('INVESTOR_CREATED', handleCreated);
    subscribe('INVESTOR_UPDATED', handleUpdated);
    subscribe('INVESTOR_DELETED', handleDeleted);
    subscribe('INVESTORS_UPDATED', () => fetchInvestors(true));

    return () => {
      unsubscribe('INVESTOR_CREATED', handleCreated);
      unsubscribe('INVESTOR_UPDATED', handleUpdated);
      unsubscribe('INVESTOR_DELETED', handleDeleted);
      unsubscribe('INVESTORS_UPDATED', () => fetchInvestors(true));
    };
  }, [subscribe, unsubscribe, fetchInvestors]);

  const addInvestor = async (investorData: Omit<Investor, 'id' | 'user_id'| 'created_at' | 'updated_at' | 'payments'>) => {
     try {
       await apiService.createInvestor(investorData);
       await fetchInvestors(true); // Auto-refresh immediately
       showToast('Investor added successfully!', 'success');
     } catch (error: any) {
       showToast(error.message, 'error');
       throw error;
     }
  };

  const updateInvestor = async (investorData: Investor) => {
    try {
      await apiService.updateInvestor(investorData.id, investorData);
      await fetchInvestors(true); // Auto-refresh immediately
      showToast('Investor updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const deleteInvestor = async (investorId: string) => {
    try {
      await apiService.deleteInvestor(investorId);
      await fetchInvestors(true); // Auto-refresh immediately
      showToast('Investor deleted successfully!', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };
  
  const addInvestorPayment = async (investorId: string, payment: Omit<InvestorPayment, 'id' | 'investor_id' | 'user_id' | 'created_at'>) => {
    try {
      await apiService.addInvestorPayment(investorId, payment);
      await fetchInvestors(true); // Critical for updating profit status/missed months
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const updateInvestorPayment = async (investorId: string, updatedPayment: InvestorPayment) => {
    try {
      await apiService.updateInvestorPayment(investorId, updatedPayment.id, updatedPayment);
      await fetchInvestors(true); // Refresh after payment edit
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const deleteInvestorPayment = async (investorId: string, paymentId: string) => {
    try {
      await apiService.deleteInvestorPayment(investorId, paymentId);
      await fetchInvestors(true); // Refresh after payment deletion
    } catch (error: any) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  return (
    <InvestorContext.Provider value={{
      investors,
      isLoading,
      addInvestor,
      updateInvestor,
      deleteInvestor,
      addInvestorPayment,
      updateInvestorPayment,
      deleteInvestorPayment,
      refreshInvestors: () => fetchInvestors(true)
    }}>
      {children}
    </InvestorContext.Provider>
  );
};

export const useInvestors = () => {
  const context = useContext(InvestorContext);
  if (context === undefined) {
    throw new Error('useInvestors must be used within an InvestorProvider');
  }
  return context;
};
