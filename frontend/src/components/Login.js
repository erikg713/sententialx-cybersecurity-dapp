import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { apiLogin } from '../api';

/**
 * Improved Login component
 * - validation and helpful error messages
 * - loading state and disabled controls while awaiting API
 * - accessible status reporting (aria-live)
 * - trims input and validates allowed characters
 * - accepts an optional onSuccess callback with API response
 */
function Login({ onSuccess }) {
  const [userId, setUserId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' }); // type: 'success' | 'error' | ''
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const validate = (value) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'User ID is required.';
    if (trimmed.length < 3) return 'User ID must be at least 3 characters.';
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return 'User ID may contain letters, numbers, underscores and hyphens only.';
    }
    return '';
  };

  const handleLogin = useCallback(async () => {
    const error = validate(userId);
    if (error) {
      setStatus({ type: 'error', message: error });
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // apiLogin is expected to return an object with message and optional ok/error fields
      const response = await apiLogin(userId.trim());

      // Normalize response handling: prefer explicit success flags, fallback to message
      if (response && (response.ok === false || response.error)) {
        throw new Error(response.error || response.message || 'Login failed.');
      }

      const message = (response && response.message) || 'Login successful.';
      setStatus({ type: 'success', message });

      if (typeof onSuccess === 'function') {
        onSuccess(response);
      }
    } catch (err) {
      // Show friendly error message
      setStatus({ type: 'error', message: err?.message || 'An unexpected error occurred during login.' });
    } finally {
      setLoading(false);
    }
  }, [userId, onSuccess]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!loading) handleLogin();
  };

  return (
    <section className="login" aria-labelledby="login-heading">
      <h2 id="login-heading">Login with Pi</h2>

      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <label htmlFor="user-id" className="sr-only">User ID</label>
        <input
          id="user-id"
          ref={inputRef}
          name="userId"
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={loading}
          aria-invalid={status.type === 'error'}
          aria-describedby="login-status"
          autoComplete="username"
        />

        <button
          type="submit"
          className="btn primary"
          onClick={handleSubmit}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Logging in…' : 'Login via Pi'}
        </button>
      </form>

      <div id="login-status" role="status" aria-live="polite" className={`status ${status.type}`}>
        {status.message && <p>{status.message}</p>}
      </div>
    </section>
  );
}

Login.propTypes = {
  onSuccess: PropTypes.func,
};

export default Login;
