import React, { memo } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * Sidebar
 *
 * - Uses NavLink so the active route is styled automatically.
 * - Accessible: role, aria-label, visually-hidden labels for screen readers.
 * - Configurable via `items` prop so the component is reusable and easy to test.
 * - Memoized export to avoid unnecessary re-renders.
 */

const defaultItems = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/threats", icon: "⚠️", label: "Threat Feed" },
  { to: "/payments", icon: "💳", label: "Payments" },
  { to: "/kyc", icon: "🧾", label: "KYC" },
];

function Sidebar({ items = defaultItems, className = "", collapsed = false }) {
  const rootClass = `sidebar ${collapsed ? "sidebar--collapsed" : ""} ${className}`.trim();

  return (
    <aside className={rootClass} role="navigation" aria-label="Main navigation">
      <ul className="sidebar__list">
        {items.map(({ to, icon, label, exact }, idx) => (
          <li className="sidebar__item" key={to ?? `${label}-${idx}`}>
            <NavLink
              to={to}
              end={!!exact}
              className={({ isActive }) =>
                `sidebar__link${isActive ? " sidebar__link--active" : ""}`
              }
            >
              <span className="sidebar__icon" aria-hidden="true">
                {icon}
              </span>
              <span className="sidebar__label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

Sidebar.propTypes = {
  // Array of navigation items. icon can be a string emoji or a React node (SVG/component).
  items: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      exact: PropTypes.bool,
    })
  ),
  // Optional extra class name(s)
  className: PropTypes.string,
  // If true, apply a compact/collapsed visual state (style in CSS)
  collapsed: PropTypes.bool,
};

export default memo(Sidebar);
