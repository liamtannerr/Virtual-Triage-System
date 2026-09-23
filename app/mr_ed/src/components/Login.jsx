import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { rememberUser } from "../api";
import { Icon, ErrorNotice } from "./UI";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogin = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      rememberUser(data);
      setPassword("");
      const from = location.state?.from;
      navigate(
        data.user_type === 2
          ? "/nurseWaiting"
          : data.user_type === 3
            ? "/doctorWaiting"
            : from?.startsWith("/enter") || from?.startsWith("/patientWaiting")
              ? from
              : "/",
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-layout">
      <aside className="auth-intro">
        <p className="eyebrow">Welcome back</p>
        <h1>
          A familiar place
          <br />
          to pick up.
        </h1>
        <p>
          Sign in to submit your details, follow your progress, or continue
          reviewing the queue.
        </p>
        <div className="auth-feature">
          <Icon name="shield" size={26} />
          <div>
            <strong>A space for every role</strong>
            <p>
              Patients, nurses, and doctors sign in here. Your account takes you
              to the right place.
            </p>
          </div>
        </div>
      </aside>
      <section className="form-card auth-card">
        <h2>Log in to your account</h2>
        <p className="muted">
          New here? <Link to="/register">Create a patient account</Link>
        </p>
        <form onSubmit={handleLogin}>
          {message && <ErrorNotice>{message}</ErrorNotice>}
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              maxLength={256}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="password-input">
              <input
                id="login-password"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                required
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button
            className="button button-primary button-full"
            type="submit"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Login"}
            <Icon />
          </button>
        </form>
        <p className="form-footnote">
          This is a school project. Use a demo account and fictional
          information.
        </p>
      </section>
    </div>
  );
}
