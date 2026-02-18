
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Explicitly extending React.Component and providing generic types for Props and State to ensure 'props' is recognized
class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render(): ReactNode {
    // Destructuring props here helps the TypeScript compiler recognize the inherited 'props' property from React.Component
    const { children } = this.props;

    if (this.state.hasError) {
      // We purposefully do NOT use useLanguage/LanguageProvider here.
      // If the context provider itself crashes, using it here would cause an infinite loop.
      return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h2>
            <p className="text-gray-500 mb-6">
              Something went wrong while loading the application.
            </p>
            
            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left border border-red-100 overflow-auto max-h-48 shadow-inner">
                 <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Error Details</p>
                 <pre className="text-xs font-mono text-red-600 break-words whitespace-pre-wrap">
                   {this.state.error.message}
                 </pre>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
