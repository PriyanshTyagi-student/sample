"use client";

import React, { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary] Error caught:", error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
          <div className="max-w-md w-full">
            {/* Glass card with error state */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
              {/* Error icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              {/* Error title */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Something went wrong
              </h2>

              {/* Error message */}
              <p className="text-slate-300 text-center mb-6">
                The application encountered an unexpected error. Please try again or contact
                support if the problem persists.
              </p>

              {/* Error details (development only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 max-h-48 overflow-auto">
                  <p className="text-xs text-slate-400 font-mono mb-2">Error Details:</p>
                  <p className="text-xs text-red-300 font-mono break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <>
                      <p className="text-xs text-slate-400 font-mono mt-3 mb-2">Stack Trace:</p>
                      <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = "/"}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-all duration-200 border border-white/20 hover:border-white/30"
                >
                  Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) throw error;
  }, [error]);

  return setError;
}
