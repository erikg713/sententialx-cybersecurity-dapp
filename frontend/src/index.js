import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

/**
 * Lightweight Error Boundary to catch render errors and avoid full white screens in production.
 * Keeps the implementation small and readable so it's clear to future maintainers.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface useful debugging info to the console; replace with a logging service if available.
    // Keep the message explicit and human-friendly.
    console.error('Uncaught render error in React tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Simple, accessible fallback UI.
      return (
        <div
          role="alert"
          style={{
            padding: 24,
            margin: '48px auto',
            maxWidth: 720,
            background: '#fff4f4',
            color: '#6b0000',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            fontFamily: 'system-ui, -apple-system, Roboto, "Helvetica Neue", Arial',
          }}
        >
          <strong>Something went wrong.</strong>
          <div style={{ marginTop: 8 }}>
            Try refreshing the page. If the problem persists, contact support.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Mount the React application into the DOM.
 * Uses createRoot from react-dom/client (React 18+) and wraps the app with
 * StrictMode + ErrorBoundary for better developer feedback and safer production behavior.
 */
function mountApp() {
  const container = document.getElementById('root');
  if (!container) {
    // Fail fast with a helpful console message if the app can't mount.
    console.error(
      'React root element not found — expected an element with id="root" in the HTML.'
    );
    return;
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

/**
 * Ensure we mount after the DOM is ready. This avoids issues if the bundle is included in <head>.
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp, { once: true });
} else {
  mountApp();
}

/**
 * Hot Module Replacement (HMR) support for both Vite (import.meta.hot) and webpack (module.hot).
 * Will attempt to re-mount the application when App changes during development.
 */
try {
  if (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.hot) {
    import.meta.hot.accept('./App', () => {
      // Re-mount to pick up the updated App module.
      mountApp();
    });
  } else if (typeof module !== 'undefined' && module.hot) {
    module.hot.accept('./App', mountApp);
  }
} catch (e) {
  // HMR environment checks sometimes throw in certain bundlers; ignore safely.
  /* noop */
}

/**
 * Optional lightweight development-only performance logging using web-vitals.
 * This is non-blocking and loaded dynamically so production bundles aren't affected.
 */
if (process.env.NODE_ENV === 'development') {
  import('web-vitals')
    .then(({ getCLS, getFID, getLCP }) => {
      // Log metrics to the console in a concise, developer-friendly format.
      getCLS(metric => console.debug('[vitals] CLS', metric));
      getFID(metric => console.debug('[vitals] FID', metric));
      getLCP(metric => console.debug('[vitals] LCP', metric));
    })
    .catch(() => {
      // If web-vitals isn't installed, don't fail the app — it's purely diagnostic.
    });
}
