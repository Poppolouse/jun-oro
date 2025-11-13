import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI error captured:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    // Soft reload to recover from transient state
    try {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (_) {}
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <h2 className="text-white text-2xl font-semibold mb-2">Bir şeyler ters gitti</h2>
            <p className="text-gray-300 mb-4">
              Beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

