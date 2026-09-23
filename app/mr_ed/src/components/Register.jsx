import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { rememberUser } from "../api";
import { PageHeading, ErrorNotice, Icon } from "./UI";

const initial = {
  name: "",
  dateOfBirth: "",
  gender: "",
  streetAddress: "",
  city: "",
  province: "",
  country: "",
  postalCode: "",
  healthNumber: "",
  email: "",
  password: "",
};
export default function Register() {
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const update = (event) =>
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", {
        ...values,
        name: values.name.trim(),
        dateOfBirth: values.dateOfBirth.replaceAll("-", "/"),
        user_type: 1,
        inTriage: "false",
      });
      rememberUser(data);
      navigate("/enter");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const field = (name, label, options = {}) => (
    <div className="field" key={name}>
      <label htmlFor={`register-${name}`}>
        {label}
        {!options.required && <span className="optional">Optional</span>}
      </label>
      <input
        id={`register-${name}`}
        name={name}
        value={values[name]}
        onChange={update}
        maxLength={256}
        {...options}
      />
    </div>
  );
  return (
    <div className="narrow-page">
      <PageHeading eyebrow="Your first step" title="Let’s get you started.">
        Create a patient account to explore the virtual triage experience.
        Already registered? <Link to="/login">Log in</Link>.
      </PageHeading>
      <div className="info-banner">
        <Icon name="shield" />
        <span>
          Use fictional details for this demo. Please don’t enter a real health
          number.
        </span>
      </div>
      <form className="form-card" onSubmit={submit}>
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <fieldset>
          <legend>
            <span className="section-number">01</span> About you
          </legend>
          <div className="form-grid">
            {field("name", "Full name", {
              required: true,
              autoComplete: "name",
              maxLength: 100,
            })}
            {field("dateOfBirth", "Date of birth", {
              type: "date",
              required: true,
              max: new Date().toISOString().slice(0, 10),
            })}
            <div className="field">
              <label htmlFor="register-gender">
                Gender <span className="optional">Optional</span>
              </label>
              <select
                id="register-gender"
                name="gender"
                value={values.gender}
                onChange={update}
              >
                <option value="">Select an option</option>
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            {field("healthNumber", "Demo health number", {
              placeholder: "Fictional information only",
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span className="section-number">02</span> Location details
          </legend>
          <p className="muted">
            These details are optional for exploring the prototype.
          </p>
          <div className="form-grid">
            {field("streetAddress", "Street address", {
              autoComplete: "street-address",
            })}
            {field("city", "City", { autoComplete: "address-level2" })}
            {field("province", "Province", { autoComplete: "address-level1" })}
            {field("postalCode", "Postal code", {
              autoComplete: "postal-code",
            })}
            {field("country", "Country", { autoComplete: "country-name" })}
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span className="section-number">03</span> Account details
          </legend>
          <div className="form-grid">
            {field("email", "Email", {
              type: "email",
              required: true,
              autoComplete: "username",
              placeholder: "you@example.com",
            })}
            {field("password", "Password", {
              type: "password",
              required: true,
              minLength: 15,
              maxLength: 128,
              autoComplete: "new-password",
              "aria-describedby": "password-help",
            })}
          </div>
          <p id="password-help" className="field-help">
            Use a memorable passphrase of 15–128 characters.
          </p>
        </fieldset>
        <div className="form-actions">
          <span className="muted">Your account will have patient access.</span>
          <button className="button button-primary" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
            <Icon />
          </button>
        </div>
      </form>
    </div>
  );
}
