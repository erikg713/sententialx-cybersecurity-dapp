import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

/*
  Lazy-load route pages to reduce initial bundle size.
  The original file mixed two different App implementations in one file;
  this file consolidates them into a single, well-structured App component.
*/
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ThreatFeedPage = lazy(() => import("./pages/ThreatFeedPage"));
const PaymentsPage = lazy(() => import("./pages/PaymentsPage"));
const KYCPage = lazy(() => import("./pages/KYCPage"));

/* Auth context for easy access to auth state throughout the app */
export const AuthContext = React.createContext({
  user: null,
  setUser: () => {},
  logout: () => {},
});

const STORAGE_KEY = "sx_user";

/* Small utility to safely parse JSON from localStorage */
function safeParseJSON(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* Minimal Error Boundary so runtime errors don't blank the whole app */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, error: err };
  }

  componentDidCatch(error, info) {
    // Production: send this to an error-tracking service
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

/* Hooked component used to protect routes that require authentication */
function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    // Redirect to login and keep the current location for post-login redirect
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

function Header({ isAuthenticated, user, onLogout }) {
  return (
    <header
      className="header"
      role="banner"
      style={{
        padding: "1rem 1.25rem",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Sentenial X</h1>
        <p style={{ margin: 0, color: "rgba(0,0,0,0.6)", fontSize: ".9rem" }}>
          The Ultimate Cyber Guardian
        </p>
      </div>

      <nav aria-label="Primary" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/" style={{ fontSize: ".9rem", color: "inherit", textDecoration: "none" }}>
          Home
        </Link>
        {isAuthenticated && (
          <>
            <Link to="/dashboard" style={{ fontSize: ".9rem", color: "inherit", textDecoration: "none" }}>
              Dashboard
            </Link>
            <Link to="/threats" style={{ fontSize: ".9rem", color: "inherit", textDecoration: "none" }}>
              Threats
            </Link>
            <Link to="/payments" style={{ fontSize: ".9rem", color: "inherit", textDecoration: "none" }}>
              Payments
            </Link>
            <Link to="/kyc" style={{ fontSize: ".9rem", color: "inherit", textDecoration: "none" }}>
              KYC
            </Link>
          </>
        )}

        <div aria-live="polite" style={{ fontSize: ".9rem", color: "rgba(0,0,0,0.6)" }}>
          {isAuthenticated ? (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span>
                Signed in as <strong>{typeof user === "string" ? user : user?.name ?? "user"}</strong>
              </span>
              <button
                onClick={onLogout}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                  cursor: "pointer",
                }}
                aria-label="Sign out"
                type="button"
              >
                Sign out
              </button>
            </div>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
      </nav>
    </header>
  );
}

function AppRouter() {
  const { user } = useContext(AuthContext);
  const isAuthenticated = Boolean(user);

  return (
    <Suspense fallback={<div style={{ padding: 12 }}>Loading interface…</div>}>
      <Routes>
        {/* Login route: redirect to dashboard if already authenticated */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/threats"
          element={
            <RequireAuth>
              <ThreatFeedPage />
            </RequireAuth>
          }
        />
        <Route
          path="/payments"
          element={
            <RequireAuth>
              <PaymentsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/kyc"
          element={
            <RequireAuth>
              <KYCPage />
            </RequireAuth>
          }
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  const [user, setUser] = useState(() => safeParseJSON(localStorage.getItem(STORAGE_KEY)));

  // Keep localStorage in sync and gracefully ignore storage errors
  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors (e.g., quota exceeded, private mode)
    }
  }, [user]);

  // Keep auth state in sync across tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setUser(safeParseJSON(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    // Send user back to login page
    navigate("/", { replace: true });
  }, [navigate]);

  const authContextValue = useMemo(() => ({ user, setUser, logout }), [user, logout]);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={authContextValue}>
      <ErrorBoundary>
        <div className="app" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {/* Skip link for keyboard users */}
          <a href="#main" style={{ position: "absolute", left: -9999, top: "auto" }} className="skip-link">
            Skip to content
          </a>

          <Header isAuthenticated={isAuthenticated} user={user} onLogout={logout} />

          <main id="main" style={{ flex: 1, padding: "1.25rem" }}>
            <AppRouter />
          </main>
        </div>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

/* Export the app wrapped in Router at the top level so hooks like useNavigate work */
export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
            }
