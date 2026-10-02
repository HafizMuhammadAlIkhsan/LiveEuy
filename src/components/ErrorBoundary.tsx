import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  isRouteBoundary?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('Unhandled UI exception captured by ErrorBoundary:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallbackTitle, fallbackDescription, isRouteBoundary } = this.props;
      const { error, showDetails } = this.state;

      return (
        <div 
          className={`flex flex-col items-center justify-center p-6 text-center animate-fade-in ${
            isRouteBoundary ? 'min-h-[55vh]' : 'min-h-screen bg-[#08090d]'
          }`}
          role="alert"
        >
          <div className="relative max-w-lg w-full bg-[#0e111a] border border-rose-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Ambient Red Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Warning Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-lg shadow-rose-900/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mb-2">
              {fallbackTitle || 'Terjadi Kendala Memuat Tampilan'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
              {fallbackDescription || 'Aplikasi mendeteksi anomali pada komponen ini. Jangan khawatir, data tontonan Anda tetap tersimpan aman.'}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-brand-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda</span>
              </button>
            </div>

            {/* Developer Details Accordion */}
            {error && (
              <div className="mt-6 pt-4 border-t border-white/[0.08] text-left">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-[11px] font-medium text-slate-500 hover:text-slate-400 transition-colors"
                >
                  <span>Detail Teknis Kesalahan</span>
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showDetails && (
                  <div className="mt-2.5 p-3 rounded-xl bg-black/50 border border-white/5 font-mono text-[10px] text-rose-300/90 overflow-x-auto max-h-40 custom-scrollbar select-all">
                    <p className="font-bold text-rose-400 mb-1">{error.name}: {error.message}</p>
                    {error.stack && (
                      <pre className="text-slate-500 whitespace-pre-wrap leading-tight text-[9px]">
                        {error.stack.split('\n').slice(0, 5).join('\n')}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
