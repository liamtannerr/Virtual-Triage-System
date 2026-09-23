import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import api, { clearUser } from "../api";

export default function EDNavbar() {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setOpen(false);
    api
      .get("/auth/user")
      .then(({ data }) => {
        if (active) setUser(data);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, [pathname]);
  const logout = async () => {
    setBusy(true);
    try {
      await api.post("/auth/logout");
      clearUser();
      setUser(null);
      window.location.assign("/login");
    } catch {
      setError("Could not log out. Please try again.");
      setBusy(false);
    }
  };
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="demo-strip">
        A student-built prototype. Explore with fictional information.
      </div>
      <nav className="site-nav" aria-label="Main navigation">
        <div className="nav-inner">
          <Link className="brand" to="/" aria-label="Mr. ED home">
            <span className="brand-mark" aria-hidden="true">
              +
            </span>
            <span>
              mr<span className="brand-dot">.</span>ed
            </span>
          </Link>
          <button
            className="menu-toggle button button-secondary"
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
          </button>
          <div id="main-nav" className={`nav-items ${open ? "is-open" : ""}`}>
            <NavLink to="/" end>
              Departments
            </NavLink>
            {user?.user_type === 1 && (
              <>
                <NavLink to="/enter">New submission</NavLink>
                <NavLink to="/patientWaiting">My waiting room</NavLink>
              </>
            )}
            {user?.user_type === 2 && (
              <NavLink to="/nurseWaiting">Nurse queue</NavLink>
            )}
            {user?.user_type === 3 && (
              <NavLink to="/doctorWaiting">Doctor queue</NavLink>
            )}
            <div className="nav-account">
              {user ? (
                <>
                  <span className="account-label">
                    {user.name.split(" ")[0]}
                    <small>
                      {["", "Patient", "Nurse", "Doctor"][user.user_type]}
                    </small>
                  </span>
                  <button
                    className="button button-secondary"
                    onClick={logout}
                    disabled={busy}
                  >
                    {busy ? "Logging out…" : "Log out"}
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login">Log in</NavLink>
                  <Link to="/register" className="button button-primary">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      {error && (
        <div className="shell">
          <p role="alert" className="error-notice">
            {error}
          </p>
        </div>
      )}
    </>
  );
}
