import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import useResource from "../hooks/useResource";
import {
  PageHeading,
  ErrorNotice,
  EmptyState,
  RefreshButton,
  Icon,
} from "./UI";

export default function PatientWaiting() {
  const user = useResource("/auth/user", 10000);
  const queue = useResource("/medical/position", 10000);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (user.data) localStorage.setItem("inTriage", user.data.inTriage);
  }, [user.data]);
  const acknowledge = async () => {
    setBusy(true);
    setError("");
    try {
      await api.put("/auth/user", {
        inTriage: "false",
        user_email: user.data.email,
      });
      localStorage.setItem("inTriage", "false");
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const state = user.data?.inTriage;
  const ready = state === "doctor";
  const declined = state === "rejected";
  const queued = queue.data?.position != null;
  return (
    <div className="narrow-page">
      <PageHeading
        eyebrow="Patient waiting room"
        title="You’re in the loop."
        action={
          <RefreshButton
            resource={{
              ...user,
              refresh: () => {
                user.refresh();
                queue.refresh();
              },
            }}
          />
        }
      >
        Follow your submission here. Updates are checked every 10 seconds.
      </PageHeading>
      {(user.error || queue.error || error) && (
        <ErrorNotice
          retry={() => {
            user.refresh();
            queue.refresh();
          }}
        >
          {error || user.error || queue.error}
        </ErrorNotice>
      )}
      {user.loading ? (
        <EmptyState loading title="Checking your submission">
          Getting your latest status…
        </EmptyState>
      ) : state === "false" ? (
        <div className="form-card">
          <EmptyState title="No active submission">
            When you submit your details, this is where you’ll see your
            progress.
          </EmptyState>
          <Link className="button button-primary" to="/enter">
            Start a submission <Icon />
          </Link>
        </div>
      ) : (
        user.data && (
          <section className="waiting-card">
            <div className="waiting-symbol">
              <Icon
                name={ready ? "check" : declined ? "list" : "clock"}
                size={38}
              />
            </div>
            <span className="tag">
              {ready
                ? "NEXT STEP AVAILABLE"
                : declined
                  ? "REVIEW COMPLETE"
                  : queued
                    ? "IN THE MEDICAL QUEUE"
                    : "SUBMISSION RECEIVED"}
            </span>
            <h2>
              {ready
                ? "The doctor has called you."
                : declined
                  ? "Your submission was declined."
                  : queued
                    ? "Your nurse review is complete."
                    : "Your submission is with the nurse."}
            </h2>
            <p>
              {ready
                ? "A doctor selected your ticket. Acknowledge this update to finish the demo workflow."
                : declined
                  ? "This submission wasn’t added to the medical queue. This demo outcome is not medical advice."
                  : queued
                    ? "Your position may change as higher-priority submissions arrive."
                    : "There’s nothing else to fill out. This page will update after your submission is reviewed."}
            </p>
            {queued && !ready && !declined && (
              <div className="position-display">
                <strong>{queue.data.position}</strong>
                <span>current position in the demo queue</span>
              </div>
            )}
            {!declined && (
              <ol className="waiting-steps">
                {["Submitted", "Nurse review", "Doctor call"].map(
                  (label, index) => (
                    <li
                      className={
                        index === 0 ||
                        (index === 1 && (queued || ready)) ||
                        ready
                          ? "done"
                          : ""
                      }
                      key={label}
                    >
                      <span>
                        <Icon name="check" size={16} />
                      </span>
                      {label}
                    </li>
                  ),
                )}
              </ol>
            )}
            {(ready || declined) && (
              <button
                className="button button-primary"
                disabled={busy}
                onClick={acknowledge}
              >
                {busy ? "Saving…" : "Acknowledge & return home"}
                <Icon />
              </button>
            )}
            <p className="update-note">
              {user.updatedAt
                ? `Last checked ${user.updatedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                : "Checking for updates"}
            </p>
          </section>
        )
      )}
      <div className="info-banner">
        <Icon name="shield" />
        <span>
          This is a simulated workflow. It is not connected to a hospital or
          emergency service.
        </span>
      </div>
    </div>
  );
}
