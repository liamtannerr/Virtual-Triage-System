import React from "react";

export function Icon({ name = "arrow", size = 20 }) {
  const paths = {
    arrow: "M5 12h14m-6-6 6 6-6 6",
    clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    check: "m5 12 4 4L19 6",
    refresh:
      "M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1",
    building: "M4 21V5h11v16M15 10h5v11M2 21h20M8 9h3M8 13h3M8 17h3",
    shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3m-4 9 3 3 5-6",
    list: "M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1",
    search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.arrow} />
    </svg>
  );
}
export function PageHeading({ eyebrow, title, children, action }) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children && <p className="page-description">{children}</p>}
      </div>
      {action}
    </header>
  );
}
export function ErrorNotice({ children, retry }) {
  return (
    <div className="error-notice" role="alert">
      <span>{children}</span>
      {retry && (
        <button type="button" className="text-button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function EmptyState({ title, children, loading = false }) {
  return (
    <div className="empty-state" role="status">
      <span className={loading ? "loader" : "empty-icon"}>
        {!loading && <Icon name="list" size={28} />}
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function RefreshButton({ resource }) {
  return (
    <button
      type="button"
      className="button button-secondary"
      onClick={resource.refresh}
      disabled={resource.refreshing}
    >
      <Icon name="refresh" />
      {resource.refreshing ? "Updating…" : "Refresh"}
    </button>
  );
}
export function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unavailable"
    : date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}
export function waitLabel(load) {
  const minutes = Math.max(0, Number(load) || 0) * 15;
  return minutes >= 60
    ? `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`
    : `${minutes} min`;
}
