import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';

// Lazy-load heavy UI parts to speed up initial bundle parsing.
const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./components/Login'));

// Simple auth context so child components can read/update auth state without prop drilling.
export const AuthContext = React.createContext({
  user: null,
  setUser: () => {},
  logout: () => {},
});

// Minimal error boundary to avoid blank app on runtime errors.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, error: err };
  }

  componentDidCatch(error, info) {
    // In a real app we'd log this to an external service.
    // console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <p>We're unable to display this part of the app right now. Try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  // user: null when anonymous, otherwise an object/string representing the authenticated user.
  const [user, setUser] = useState(null);
  const isAuthenticated = Boolean(user);

  // Hydrate auth state from localStorage so refresh keeps the session visually consistent.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sx_user');
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      // ignore parse/localStorage errors; start unauthenticated
      setUser(null);
    }
  }, []);

  // Keep localStorage in sync whenever user changes.
  useEffect(() => {
    try {
      if (user) localStorage.setItem('sx_user', JSON.stringify(user));
      else localStorage.removeItem('sx_user');
    } catch {
      // ignore storage errors
    }
  }, [user]);

  const logout = () => setUser(null);

  // Memoize context value to avoid unnecessary re-renders of consumers.
  const authContextValue = useMemo(() => ({ user, setUser, logout }), [user]);

  return (
    <AuthContext.Provider value={authContextValue}>
      <ErrorBoundary>
        <div className="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header
            className="header"
            role="banner"
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Sentenial X</h1>
              <p style={{ margin: 0, color: 'rgba(0,0,0,0.6)', fontSize: '.9rem' }}>The Ultimate Cyber Guardian</p>
            </div>

            <div aria-live="polite" style={{ fontSize: '.9rem', color: 'rgba(0,0,0,0.6)' }}>
              {isAuthenticated ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span>Signed in as <strong>{typeof user === 'string' ? user : user?.name ?? 'user'}</strong></span>
                  <button
                    onClick={logout}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                    aria-label="Sign out"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <span>Not signed in</span>
              )}
            </div>
          </header>

          <main style={{ flex: 1, padding: '1.25rem' }}>
            <Suspense fallback={<div style={{ padding: 12 }}>Loading interface…</div>}>
              {/* Show Dashboard only when authenticated; otherwise show Login.
                  This keeps the UI focused and reduces unnecessary component mounts. */}
              {isAuthenticated ? <Dashboard /> : <Login />}
            </Suspense>
          </main>
        </div>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

export default App;
