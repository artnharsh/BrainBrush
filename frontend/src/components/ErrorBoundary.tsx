import React from "react";
import { reportError, toAppError } from "../utils/errorHandler";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || "Something went wrong" };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const appError = toAppError(error, "runtime");
    reportError({ ...appError, details: errorInfo.componentStack || appError.details });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h1 className="text-2xl font-black text-red-600 mb-3">Something broke</h1>
            <p className="font-bold text-gray-700 mb-6">
              {this.state.message || "Unexpected UI error"}
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="bg-black text-white font-bold px-5 py-2 rounded-lg"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
