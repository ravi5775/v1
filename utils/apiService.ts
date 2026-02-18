
// utils/apiService.ts
import { Admin, Loan, Transaction, Investor, InvestorPayment, Notification, LoginHistory } from '../types';

const API_BASE = '/api';

/**
 * CSRF Management
 */
let cachedCsrfToken: string | null = null;

const fetchCsrfToken = async () => {
    try {
        const response = await fetch(`${API_BASE}/csrf-token`);
        const data = await response.json();
        cachedCsrfToken = data.csrfToken;
        return data.csrfToken;
    } catch (e) {
        console.error("Failed to fetch CSRF token", e);
        return null;
    }
};

/**
 * Shared Fetch Wrapper
 */
const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    
    // Ensure we have a CSRF token for mutating requests
    const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (mutatingMethods.includes(options.method || 'GET') && !cachedCsrfToken) {
        await fetchCsrfToken();
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(cachedCsrfToken ? { 'X-CSRF-Token': cachedCsrfToken } : {}),
        ...((options.headers as any) || {}),
    };

    const response = await fetch(`${API_BASE}${url}`, { 
        ...options, 
        headers,
        credentials: 'include' // Required for CSRF cookies
    });
    
    if (response.status === 401) {
        localStorage.removeItem('authToken');
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle validation errors
        if (response.status === 400 && errorData.errors) {
            const firstError = errorData.errors[0];
            throw new Error(firstError.msg || 'Validation error');
        }
        
        // Handle CSRF expiration
        if (response.status === 403 && errorData.message?.includes('CSRF')) {
            await fetchCsrfToken();
            // Optional: Retry the request once
            throw new Error('Security token expired. Please try again.');
        }

        throw new Error(errorData.message || `Server Error: ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
};

const apiService = {
  // Auth & Admin Persistence
  login: async (email: string, password?: string): Promise<{ token: string; user: Admin }> => {
    return authFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
  },

  createAdmin: async (email: string, password: string): Promise<any> => {
      return authFetch('/admin/create', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
      });
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<any> => {
      return authFetch('/admin/change-password', {
          method: 'PUT',
          body: JSON.stringify({ oldPassword, newPassword }),
      });
  },

  getLoginHistory: async (): Promise<LoginHistory[]> => {
      return authFetch('/admin/login-history');
  },

  // Centralized Data Operations
  getLoans: async (): Promise<Loan[]> => {
    return authFetch('/loans');
  },

  createLoan: async (loanData: Partial<Loan>): Promise<Loan> => {
    return authFetch('/loans', {
        method: 'POST',
        body: JSON.stringify(loanData),
    });
  },

  updateLoan: async (id: string, loanData: Partial<Loan>): Promise<Loan> => {
    return authFetch(`/loans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(loanData),
    });
  },

  deleteLoans: async (ids: string[]): Promise<void> => {
    return authFetch('/loans/delete-multiple', {
        method: 'POST',
        body: JSON.stringify({ ids }),
    });
  },

  addTransaction: async (loanId: string, transaction: Omit<Transaction, 'id' | 'loan_id' | 'user_id' | 'created_at'>): Promise<void> => {
     return authFetch(`/loans/${loanId}/transactions`, {
         method: 'POST',
         body: JSON.stringify(transaction),
     });
  },

  updateTransaction: async (loanId: string, transactionId: string, transaction: Partial<Transaction>): Promise<void> => {
    return authFetch(`/loans/${loanId}/transactions/${transactionId}`, {
        method: 'PUT',
        body: JSON.stringify(transaction),
    });
  },

  deleteTransaction: async (loanId: string, transactionId: string): Promise<void> => {
    return authFetch(`/loans/${loanId}/transactions/${transactionId}`, {
        method: 'DELETE',
    });
  },

  getInvestors: async (): Promise<Investor[]> => {
      return authFetch('/investors');
  },

  createInvestor: async (data: Partial<Investor>): Promise<Investor> => {
      return authFetch('/investors', {
          method: 'POST',
          body: JSON.stringify(data),
      });
  },

  updateInvestor: async (id: string, data: Partial<Investor>): Promise<Investor> => {
    return authFetch(`/investors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
  },

  deleteInvestor: async (id: string): Promise<void> => {
    return authFetch(`/investors/${id}`, {
        method: 'DELETE',
    });
  },

  addInvestorPayment: async (investorId: string, data: Partial<InvestorPayment>): Promise<InvestorPayment> => {
      return authFetch(`/investors/${investorId}/payments`, {
          method: 'POST',
          body: JSON.stringify(data),
      });
  },

  updateInvestorPayment: async (investorId: string, paymentId: string, data: Partial<InvestorPayment>): Promise<Investor> => {
    return authFetch(`/investors/${investorId}/payments/${paymentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
  },

  deleteInvestorPayment: async (investorId: string, paymentId: string): Promise<void> => {
    return authFetch(`/investors/${investorId}/payments/${paymentId}`, {
        method: 'DELETE',
    });
  },

  getNotifications: async (isRead?: boolean): Promise<Notification[]> => {
      const query = isRead !== undefined ? `?is_read=${isRead}` : '';
      return authFetch(`/notifications${query}`);
  },

  createNotifications: async (notifications: Omit<Notification, 'id' | 'created_at' | 'user_id'>[]): Promise<void> => {
    return authFetch('/notifications', {
        method: 'POST',
        body: JSON.stringify(notifications),
    });
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
      return authFetch(`/notifications/${id}/read`, {
          method: 'PUT',
      });
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    return authFetch('/notifications/read-all', {
        method: 'PUT',
    });
  },

  restoreBackup: async (backupData: any): Promise<void> => {
      return authFetch('/admin/restore', {
          method: 'POST',
          body: JSON.stringify(backupData),
      });
  }
};

export default apiService;
