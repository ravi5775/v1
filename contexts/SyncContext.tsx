import React, { createContext, useContext, ReactNode } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface SyncContextType {
  isOnline: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();

  // In a full implementation, this context would also manage data synchronization logic.
  // For now, it provides the online status to the rest of the app.

  return (
    <SyncContext.Provider value={{ isOnline }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};