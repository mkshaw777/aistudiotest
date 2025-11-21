import React, { ErrorInfo, ReactNode } from 'react';
import { Button } from './components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-100 p-4">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold text-mk-error mb-4">Oops! Something went wrong.</h1>
            <p className="text-mk-gray-dark mb-6">
              We've encountered an unexpected error. Please try reloading the page.
            </p>
            {this.state.error && (
              <details className="mb-4 text-left bg-white p-3 rounded-md border text-xs text-mk-gray-text">
                  <summary>Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-all">
                      {this.state.error.toString()}
                  </pre>
              </details>
            )}
            <Button onClick={this.handleReload} size="lg">
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;