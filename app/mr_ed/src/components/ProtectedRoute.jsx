import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api, { rememberUser } from "../api";

export default function ProtectedRoute({ roles, children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    let active = true;
    api
      .get("/auth/user")
      .then(({ data }) => {
        if (active) {
          rememberUser(data);
          setState({ user: data });
        }
      })
      .catch((error) => {
        if (active)
          setState({
            error: error.response?.status === 401 ? "login" : "unavailable",
          });
      });
    return () => {
      active = false;
    };
  }, []);
  if (state.loading) return <p>Checking your session…</p>;
  if (state.error === "unavailable")
    return <p>Unable to check your session. Please refresh to try again.</p>;
  if (!state.user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (!roles.includes(state.user.user_type))
    return <p>You do not have permission to access this page.</p>;
  return children;
}
