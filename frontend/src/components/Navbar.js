import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

/**
 * Navbar component
 *
 * - Responsive: includes a keyboard-accessible hamburger for small screens
 * - Accessible: aria attributes, semantic nav, focusable controls
 * - Maintainable: link list is data-driven
 * - Performance: React.memo-like behavior via stable callbacks and minimal state
 */

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/threats", label: "Threats" },
  { to: "/payments", label: "Payments" },
  { to: "/kyc", label: "KYC" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const location = useLocation();

  // Close mobile menu on navigation changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const onToggle = useCallback(() => setOpen((v) => !v), []);
  const onLinkClick = useCallback(() => setOpen(false), []);

  return (
    <header>
      <nav className="navbar" aria-label="Primary navigation">
        <div className="navbar__brand">
          {/* Lightweight inline SVG logo so it's not dependent on external assets */}
          <span className="navbar__logo" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7v6c0 5 3.8 9.6 10 11 6.2-1.4 10-6 10-11V7l-10-5z"
                fill="currentColor"
                opacity="0.12"
              />
              <path
                d="M12 2L2 7v6c0 5 3.8 9.6 10 11 6.2-1.4 10-6 10-11V7l-10-5z"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
              <path d="M8.5 12.5l3 3 4.5-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </span>

          <h1 className="navbar__title">Sentenial‑X</h1>
        </div>

        <button
          ref={toggleRef}
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={onToggle}
        >
          {/* simple hamburger + close icon via CSS classes or inline fallback */}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            {open ? (
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 7h18" />
                <path d="M3 12h18" />
                <path d="M3 17h18" />
              </g>
            )}
          </svg>
        </button>

        <div
          ref={menuRef}
          id="primary-navigation"
          className={`navbar__links ${open ? "navbar__links--open" : ""}`}
          role="menu"
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) =>
                "navbar__link" + (isActive ? " navbar__link--active" : "")
              }
              onClick={onLinkClick}
              role="menuitem"
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default React.memo(Navbar);
