import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('⚠️ Studix ErrorBoundary caught runtime exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#131722] text-slate-100 flex items-center justify-center p-4 selection:bg-brand-500 selection:text-white">
          <div className="relative max-w-md w-full rounded-3xl neu-flat p-6 sm:p-8 text-center border border-rose-500/20 shadow-2xl overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
            </div>

            <h2 className="text-xl font-extrabold text-white mb-2">
              Something went slightly off
            </h2>

            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              An unexpected display glitch occurred. Don&apos;t worry, your documents and data are completely safe.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 rounded-xl bg-black/40 border border-slate-800 text-left overflow-hidden">
                <p className="text-[11px] font-mono text-rose-300 truncate">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl neu-button text-white font-bold text-xs shadow-glow transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-brand-400" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 rounded-xl neu-button text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-accent-emerald" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
