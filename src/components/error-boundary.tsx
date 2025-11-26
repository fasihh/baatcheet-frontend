import React, { Component, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  resetKeys?: any[];
  onAuthFailure?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;

      if (prevKeys.length !== currentKeys.length ||
        prevKeys.some((key, index) => key !== currentKeys[index])) {
        this.setState({ hasError: false, error: null });
      }
    }

    // Check for auth failure and call the callback
    if (this.state.hasError &&
      this.state.error?.message === "Auth failure" &&
      this.props.onAuthFailure) {
      this.props.onAuthFailure();
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Check for auth failure immediately
    if (error.message === "Auth failure" && this.props.onAuthFailure) {
      this.props.onAuthFailure();
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Don't render anything if it's an auth failure - let the redirect happen
      if (this.state.error?.message === "Auth failure") {
        return null;
      }

      return (
        <div className="flex flex-col items-center justify-center p-4 w-full h-full">
          <Alert className="bg-destructive/5 max-w-xl" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'Something went wrong'}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                location.reload();
              }}
            >
              Try again
            </Button>
            <Button onClick={() => history.back()} variant="outline">
              Go back
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
