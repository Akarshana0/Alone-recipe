// src/components/ErrorBoundary.jsx
// Catches any render-time JS error so a single crash doesn't kill the whole app.
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-orbitron text-red-400 text-sm tracking-widest mb-3">
            RUNTIME ERROR
          </h2>
          <p className="text-white/40 text-sm mb-2 leading-relaxed">
            Something went wrong. Please refresh the page.
          </p>
          {import.meta.env.DEV && (
            <pre className="text-left text-xs text-red-400/70 bg-red-400/5 border border-red-400/10 rounded-lg p-3 mt-4 overflow-auto max-h-40">
              {this.state.error?.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 btn-cyber text-xs px-6 py-2.5"
            style={{ clipPath: "none", borderRadius: "8px" }}
          >
            RELOAD PAGE
          </button>
        </div>
      </div>
    );
  }
}
