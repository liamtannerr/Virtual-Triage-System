import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import useResource from "../hooks/useResource";
import { initialSymptoms, symptomGroups } from "../symptoms";
import { PageHeading, ErrorNotice, EmptyState, Icon } from "./UI";

export default function EnterVirtualTriage() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState({
    ED: params.get("department") || "",
    durationOfSymptoms: "",
    listAllergies: "",
    pastMedicalConditions: "",
  });
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [habits, setHabits] = useState({ smoking: "", alcohol: "", drugs: "" });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const departments = useResource("/emergency/department");
  const navigate = useNavigate();
  const selected = departments.data?.find(
    (item) => String(item.establishmentID) === details.ED,
  );
  const changeStep = (value) => {
    setStep(value);
    setError("");
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!selected) {
      setError("Please choose an available department.");
      return;
    }
    if (step < 2) {
      changeStep(step + 1);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/triage/tickets", {
        ...details,
        ED: Number(details.ED),
        ...symptoms,
        substanceHabits: Object.fromEntries(
          Object.entries(habits).map(([key, value]) => [key, value === "yes"]),
        ),
        consent,
      });
      localStorage.setItem("inTriage", "true");
      navigate("/patientWaiting");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  if (
    localStorage.getItem("inTriage") &&
    localStorage.getItem("inTriage") !== "false"
  )
    return (
      <div className="narrow-page">
        <EmptyState title="You already have a submission">
          Visit your waiting room to see the latest update.
        </EmptyState>
        <Link className="button button-primary" to="/patientWaiting">
          Open my waiting room <Icon />
        </Link>
      </div>
    );
  return (
    <div className="narrow-page">
      <PageHeading eyebrow="Patient intake" title="Tell us what’s going on.">
        A few details help the nurse understand your submission. Use fictional
        information for this demo.
      </PageHeading>
      <ol className="form-steps">
        {["Your details", "Symptoms", "Review & submit"].map((title, index) => (
          <li
            key={title}
            className={
              step === index ? "current" : step > index ? "complete" : ""
            }
            aria-current={step === index ? "step" : undefined}
          >
            <span>
              {step > index ? <Icon name="check" size={16} /> : index + 1}
            </span>
            {title}
          </li>
        ))}
      </ol>
      <form onSubmit={submit} className="form-card">
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <fieldset disabled={busy}>
          {step === 0 && (
            <>
              <h2>Start with the essentials</h2>
              <p className="muted">
                Choose a department and add a little background.
              </p>
              {departments.error && (
                <ErrorNotice retry={departments.refresh}>
                  {departments.error}
                </ErrorNotice>
              )}
              <div className="field">
                <label htmlFor="triage-department">Emergency department</label>
                <select
                  id="triage-department"
                  required
                  value={details.ED}
                  onChange={(e) =>
                    setDetails({ ...details, ED: e.target.value })
                  }
                >
                  <option value="">
                    {departments.loading
                      ? "Loading departments…"
                      : "Choose a department"}
                  </option>
                  {departments.data?.map((item) => (
                    <option
                      key={item.establishmentID}
                      value={item.establishmentID}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              {[
                [
                  "durationOfSymptoms",
                  "How long have the symptoms been present?",
                  "For example, two days",
                ],
                [
                  "listAllergies",
                  "Allergies",
                  "List allergies, or enter “None”",
                ],
                [
                  "pastMedicalConditions",
                  "Relevant medical history",
                  "List conditions, or enter “None”",
                ],
              ].map(([name, label, placeholder]) => (
                <div className="field" key={name}>
                  <label htmlFor={name}>{label}</label>
                  <textarea
                    id={name}
                    required
                    maxLength={2000}
                    rows={2}
                    placeholder={placeholder}
                    value={details[name]}
                    onChange={(e) =>
                      setDetails({ ...details, [name]: e.target.value })
                    }
                  />
                </div>
              ))}
            </>
          )}
          {step === 1 && (
            <>
              <h2>Choose the symptoms that apply</h2>
              <p className="muted">
                Select any relevant symptoms. Leave a category unchecked if none
                apply.
              </p>
              <div className="symptom-grid">
                {symptomGroups.map(([group, title, fields]) => (
                  <fieldset className="symptom-group" key={group}>
                    <legend>{title}</legend>
                    {fields.map(([key, label]) => (
                      <label className="check-option" key={key}>
                        <input
                          type="checkbox"
                          checked={symptoms[group][key]}
                          onChange={(e) =>
                            setSymptoms((current) => ({
                              ...current,
                              [group]: {
                                ...current[group],
                                [key]: e.target.checked,
                              },
                            }))
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
              <h3 className="subheading">A little more context</h3>
              {[
                ["smoking", "Do you smoke?"],
                ["alcohol", "Do you consume alcohol?"],
                ["drugs", "Do you use recreational drugs?"],
              ].map(([key, label]) => (
                <fieldset className="radio-field" key={key}>
                  <legend>{label}</legend>
                  <div>
                    {["yes", "no"].map((value) => (
                      <label className="check-option" key={value}>
                        <input
                          type="radio"
                          name={key}
                          value={value}
                          checked={habits[key] === value}
                          required
                          onChange={() =>
                            setHabits({ ...habits, [key]: value })
                          }
                        />
                        {value === "yes" ? "Yes" : "No"}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </>
          )}
          {step === 2 && (
            <>
              <h2>Take a moment to review</h2>
              <p className="muted">
                You can go back to make changes before sending this to the nurse
                queue.
              </p>
              <dl className="detail-list">
                <div>
                  <dt>Department</dt>
                  <dd>{selected?.name}</dd>
                </div>
                <div>
                  <dt>Symptom duration</dt>
                  <dd>{details.durationOfSymptoms}</dd>
                </div>
                <div>
                  <dt>Allergies</dt>
                  <dd>{details.listAllergies}</dd>
                </div>
                <div>
                  <dt>Medical history</dt>
                  <dd>{details.pastMedicalConditions}</dd>
                </div>
              </dl>
              <h3 className="subheading">Selected symptoms</h3>
              <div className="chip-list">
                {symptomGroups.flatMap(([group, title, fields]) =>
                  fields
                    .filter(([key]) => symptoms[group][key])
                    .map(([key, label]) => (
                      <span className="symptom-chip" key={`${group}-${key}`}>
                        {title}: {label}
                      </span>
                    )),
                )}
                {!Object.values(symptoms).some((group) =>
                  Object.values(group).some(Boolean),
                ) && <p className="muted">No symptoms selected.</p>}
              </div>
              <dl className="detail-list compact">
                {Object.entries(habits).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key[0].toUpperCase() + key.slice(1)}</dt>
                    <dd>{value === "yes" ? "Yes" : "No"}</dd>
                  </div>
                ))}
              </dl>
              <label className="consent-box">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  I consent to submitting this information for review in the
                  demo. I have used fictional information.
                </span>
              </label>
            </>
          )}
          <div className="form-actions">
            {step > 0 ? (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => changeStep(step - 1)}
              >
                Back
              </button>
            ) : (
              <Link className="text-button" to="/">
                Cancel
              </Link>
            )}
            <button
              className="button button-primary"
              disabled={
                busy || departments.loading || !departments.data?.length
              }
            >
              {busy
                ? "Submitting…"
                : step === 2
                  ? "Submit to nurse queue"
                  : "Continue"}
              <Icon />
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
