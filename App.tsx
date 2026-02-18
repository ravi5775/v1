import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoanProvider } from './contexts/LoanContext';
import { InvestorProvider } from './contexts/InvestorContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LogoProvider } from './contexts/LogoContext';
import { ToastProvider } from './contexts/ToastContext';
import { SyncProvider } from './contexts/SyncContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import LoanForm from './pages/LoanForm';
import RepaymentPage from './pages/RepaymentPage';
import InvestorDashboard from './pages/InvestorDashboard';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/loan/new" element={<LoanForm />} />
          <Route path="/loan/edit/:id" element={<LoanForm />} />
          <Route path="/repayments" element={<RepaymentPage />} />
          <Route path="/investors" element={<InvestorDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Toast />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SyncProvider>
        <AuthProvider>
          <WebSocketProvider>
            <LogoProvider>
              <LanguageProvider>
                <ToastProvider>
                  <LoanProvider>
                    <InvestorProvider>
                      <NotificationProvider>
                        <AppRoutes />
                      </NotificationProvider>
                    </InvestorProvider>
                  </LoanProvider>
                </ToastProvider>
              </LanguageProvider>
            </LogoProvider>
          </WebSocketProvider>
        </AuthProvider>
      </SyncProvider>
    </ErrorBoundary>
  );
};

export default App;