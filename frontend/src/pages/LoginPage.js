import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

/**
 * LoginPage
 *
 * Improvements:
 * - Accessibility: associated label, aria-describedby, aria-live for errors, focus management.
 * - UX: "Remember me" toggle (localStorage vs sessionStorage), inline validation, visual loading state.
 * - Robustness: username sanitization, length and character validation, disabled submit when invalid.
 * - Maintainability: constants and small helper functions for clarity.
 */

const STORAGE_KEY = "user";
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 30;
const USERNAME_REGEX = /^[A-Za-z0-9_-]+$/; // letters, numbers, underscore, hyphen

function sanitizeUsername(value = "") {
  return value.trim();
}

function validateUsername(value = "") {
  const trimmed = sanitizeUsername(value);
  if (!trimmed) return "Username is required.";
  if (trimmed.length < MIN_USERNAME_LENGTH)
    return `Username must be at least ${MIN_USERNAME_LENGTH} characters.`;
  if (trimmed.length > MAX_USERNAME_LENGTH)
    return `Username must be ${MAX_USERNAME_LENGTH} characters or fewer.`;
  if (!USERNAME_REGEX.test(trimmed))
    return "Only letters, numbers, underscores and hyphens are allowed.";
  return "";
}

function readStoredUser() {
  // Check both localStorage and sessionStorage for convenience
  try {
    return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function writeStoredUser(username, remember) {
  try {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, username);
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, username);
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage may be unavailable; swallow errors to avoid breaking UX
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [username, setUsername] = useState(() => readStoredUser());
  const [remember, setRemember] = useState(() => !!localStorage.getItem(STORAGE_KEY));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // If user is already stored, redirect immediately (no double history entry)
  useEffect(() => {
    const stored = readStoredUser();
    if (stored) {
      // Small timeout so the app can finish any mount effects (keeps nav predictable)
      const t = setTimeout(() => navigate("/dashboard", { replace: true }), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [navigate]);

  // Validate on username change
  useEffect(() => {
    setError((prev) => {
      // Validate and only update if different to avoid re-renders
      const next = validateUsername(username);
      return prev === next ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (submitting) return;

      const sanitized = sanitizeUsername(username);
      const validationError = validateUsername(sanitized);
      if (validationError) {
        setError(validationError);
        inputRef.current?.focus();
        return;
      }

      setSubmitting(true);
      setError("");

      // Simulate a small delay to show loading state (could be replaced by real auth)
      setTimeout(() => {
        writeStoredUser(sanitized, remember);
        setSubmitting(false);
        navigate("/dashboard");
      }, 250);
    },
    [username, remember, navigate, submitting]
  );

  const handleClear = useCallback(() => {
    setUsername("");
    setError("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className="page-container" role="main">
      <h1>🔐 Sentenial‑X</h1>
      <p className="lead">Sign in to access your dashboard</p>

      <form onSubmit={handleSubmit} className="form" autoComplete="off" noValidate>
        <div className="form-row">
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            id="username"
            ref={inputRef}
            name="username"
            type="text"
            inputMode="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            maxLength={MAX_USERNAME_LENGTH}
            aria-describedby="username-help username-error"
            aria-invalid={!!error}
            disabled={submitting}
          />
          <div id="username-help" className="hint">
            {MIN_USERNAME_LENGTH}-{MAX_USERNAME_LENGTH} chars; letters, numbers, _ and -
          </div>
          <div
            id="username-error"
            className="error"
            role="alert"
            aria-live="polite"
            style={{ minHeight: "1.2em" }}
          >
            {error}
          </div>
        </div>

        <div className="form-row form-row-inline">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={submitting}
            />
            Remember me
          </label>

          <button
            type="button"
            className="link-btn"
            onClick={handleClear}
            disabled={submitting && !username}
            aria-label="Clear username"
          >
            Clear
          </button>
        </div>

        <div className="form-row">
          <button
            type="submit"
            className="btn primary"
            disabled={!!error || !username || submitting}
            aria-busy={submitting}
          >
            {submitting ? "Signing in…" : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
