import React, { useEffect, useState } from "react";
import api from "../api";
import useResource from "../hooks/useResource";
import { symptomGroups, priorityLabels } from "../symptoms";
import {
  PageHeading,
  ErrorNotice,
  EmptyState,
  RefreshButton,
  Icon,
  formatDate,
} from "./UI";

export default function StaffQueue({ role }) {
  const nurse = role === "nurse";
  const queue = useResource(
    nurse ? "/triage/tickets" : "/medical/tickets",
    30000,
  );
  const departments = useResource("/emergency/department", 30000);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmReject, setConfirmReject] = useState(false);
  const records = queue.data || [];
  const identifier = (item) => (nurse ? item.ticketID : item.VTticketID);
  const selected = records.find((item) => identifier(item) === selectedId);
  const ticket = selected && (nurse ? selected : selected.VTTicket);
  const departmentName = (id) =>
    departments.data?.find((item) => item.establishmentID === id)?.name ||
    `Department ${id}`;
  useEffect(() => {
    setPriority("");
    setError("");
    setConfirmReject(false);
  }, [selectedId]);
  const select = (item) => {
    setSelectedId(identifier(item));
    setNotice("");
  };
  const processTicket = async () => {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    try {
      if (nurse) {
        if (Number(priority) === 10)
          await api.put("/auth/user", {
            inTriage: "rejected",
            user_email: ticket.email,
          });
        else {
          await api.post("/medical/ticket", {
            VTticketID: ticket.ticketID,
            priority: Number(priority),
            startTime: new Date().toISOString(),
            VTTicket: ticket,
          });
          await api.put(`/emergency/department/${ticket.ED}/currentLoad`, {
            increment: 1,
          });
        }
        await api.delete(`/triage/tickets/${ticket.ticketID}`);
      } else {
        await api.put("/auth/user", {
          inTriage: "doctor",
          user_email: ticket.email,
        });
        await api.delete(`/medical/tickets/${selected.VTticketID}`);
        await api.put(`/emergency/department/${ticket.ED}/currentLoad`, {
          increment: -1,
        });
      }
      setNotice(
        nurse
          ? Number(priority) === 10
            ? "Submission declined. The patient’s waiting room will show the update."
            : "Review complete. The ticket is now in the medical queue."
          : "Patient called. Their waiting room will show the update.",
      );
      setSelectedId(null);
      queue.refresh();
      departments.refresh();
    } catch (err) {
      setError(
        `${err.message} Refresh the queue to check its status before trying again.`,
      );
    } finally {
      setBusy(false);
      setConfirmReject(false);
    }
  };
  const filtered = records.filter((item) => {
    const source = nurse ? item : item.VTTicket;
    return `${source.patient} ${source.email} ${departmentName(source.ED)}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });
  return (
    <>
      <PageHeading
        eyebrow={`${nurse ? "Nurse" : "Doctor"} workspace`}
        title={
          nurse ? "Every review starts here." : "Your next patient, in view."
        }
        action={<RefreshButton resource={queue} />}
      >
        {nurse
          ? "Review incoming submissions and guide each patient to their next step."
          : "Review prioritized tickets and let a patient know when you’re ready."}
      </PageHeading>
      <div className="workspace-stats">
        <div>
          <span className="icon-tile">
            <Icon name="list" />
          </span>
          <div>
            <strong>{queue.data ? records.length : "—"}</strong>
            <span>{nurse ? "Awaiting review" : "In the medical queue"}</span>
          </div>
        </div>
        <div>
          <span className="icon-tile">
            <Icon name="clock" />
          </span>
          <div>
            <strong>30 sec</strong>
            <span>Automatic queue refresh</span>
          </div>
        </div>
        <div>
          <span className="icon-tile">
            <Icon name="shield" />
          </span>
          <div>
            <strong>{nurse ? "Nurse" : "Doctor"} access</strong>
            <span>All demo departments</span>
          </div>
        </div>
      </div>
      {notice && (
        <div role="status" className="success-notice">
          <Icon name="check" />
          {notice}
        </div>
      )}
      {queue.error && (
        <ErrorNotice retry={queue.refresh}>{queue.error}</ErrorNotice>
      )}
      {queue.loading ? (
        <EmptyState loading title="Loading the queue">
          Getting the latest submissions…
        </EmptyState>
      ) : (
        <div className="workspace-grid">
          <section className="queue-panel" aria-label="Patient queue">
            <div className="queue-panel-heading">
              <h2>{nurse ? "Incoming submissions" : "Medical queue"}</h2>
              <span className="count-badge">{records.length}</span>
            </div>
            <label className="search-field">
              <Icon name="search" />
              <input
                aria-label="Search queue"
                placeholder="Search name or department"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="ticket-list">
              {filtered.map((item) => {
                const source = nurse ? item : item.VTTicket;
                return (
                  <button
                    key={identifier(item)}
                    className={`ticket-card ${selectedId === identifier(item) ? "selected" : ""}`}
                    onClick={() => select(item)}
                    disabled={busy}
                  >
                    <div className="ticket-name">
                      <span className="avatar">
                        {source.patient?.slice(0, 1).toUpperCase() || "P"}
                      </span>
                      <strong>{source.patient}</strong>
                      {!nurse && (
                        <span
                          className={`priority-tag ${item.priority <= 3 ? "urgent" : ""}`}
                        >
                          P{item.priority}
                        </span>
                      )}
                    </div>
                    <p>{departmentName(source.ED)}</p>
                    <small>
                      {formatDate(nurse ? source.timestamp : item.startTime)}
                    </small>
                    <span className="ticket-arrow">
                      <Icon size={17} />
                    </span>
                  </button>
                );
              })}
              {!filtered.length && (
                <EmptyState
                  title={
                    search ? "No matching submissions" : "You’re all caught up"
                  }
                >
                  {search
                    ? "Try another name or department."
                    : "New tickets will appear here when the queue refreshes."}
                </EmptyState>
              )}
            </div>
          </section>
          <section className="review-panel" aria-label="Ticket review">
            {!ticket ? (
              <EmptyState title="Choose a ticket to get started">
                Patient details and review actions will appear here.
              </EmptyState>
            ) : (
              <>
                <div className="review-heading">
                  <div>
                    <p className="eyebrow">
                      {nurse
                        ? "Submission details"
                        : `Priority ${selected.priority} · ${priorityLabels[selected.priority - 1]}`}
                    </p>
                    <h2>{ticket.patient}</h2>
                    <p>{ticket.email}</p>
                  </div>
                  <span className="icon-tile">
                    <Icon name="list" />
                  </span>
                </div>
                <dl className="detail-list">
                  <div>
                    <dt>Department</dt>
                    <dd>{departmentName(ticket.ED)}</dd>
                  </div>
                  <div>
                    <dt>Submitted</dt>
                    <dd>{formatDate(ticket.timestamp)}</dd>
                  </div>
                  <div>
                    <dt>Symptom duration</dt>
                    <dd>{ticket.durationOfSymptoms}</dd>
                  </div>
                  <div>
                    <dt>Allergies</dt>
                    <dd>
                      {Array.isArray(ticket.listAllergies)
                        ? ticket.listAllergies.join(", ")
                        : ticket.listAllergies || "None provided"}
                    </dd>
                  </div>
                  <div>
                    <dt>Medical history</dt>
                    <dd>
                      {Array.isArray(ticket.pastMedicalConditions)
                        ? ticket.pastMedicalConditions.join(", ")
                        : ticket.pastMedicalConditions || "None provided"}
                    </dd>
                  </div>
                </dl>
                <h3 className="subheading">Reported symptoms</h3>
                <div className="review-symptoms">
                  {symptomGroups.map(([key, title, fields]) => (
                    <div key={key}>
                      <h4>{title}</h4>
                      <div className="chip-list">
                        {fields
                          .filter(([name]) => ticket[key]?.[name])
                          .map(([name, label]) => (
                            <span className="symptom-chip" key={name}>
                              {label}
                            </span>
                          ))}
                        {!fields.some(([name]) => ticket[key]?.[name]) && (
                          <span className="muted">None selected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <dl className="detail-list compact">
                  {Object.entries(ticket.substanceHabits || {}).map(
                    ([key, value]) => (
                      <div key={key}>
                        <dt>{key[0].toUpperCase() + key.slice(1)}</dt>
                        <dd>{value ? "Yes" : "No"}</dd>
                      </div>
                    ),
                  )}
                  <div>
                    <dt>Consent</dt>
                    <dd>{ticket.consent ? "Provided" : "Not provided"}</dd>
                  </div>
                </dl>
                <form
                  className="review-actions"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (nurse && Number(priority) === 10)
                      setConfirmReject(true);
                    else processTicket();
                  }}
                >
                  {error && <ErrorNotice>{error}</ErrorNotice>}
                  {nurse && (
                    <div className="field">
                      <label htmlFor="review-priority">Review outcome</label>
                      <select
                        id="review-priority"
                        value={priority}
                        required
                        disabled={busy}
                        onChange={(e) => {
                          setPriority(e.target.value);
                          setConfirmReject(false);
                        }}
                      >
                        <option value="">Choose a priority or decline</option>
                        {priorityLabels.map((label, index) => (
                          <option key={label} value={index + 1}>
                            Priority {index + 1} — {label}
                          </option>
                        ))}
                        <option value="10">Decline submission</option>
                      </select>
                    </div>
                  )}
                  {confirmReject ? (
                    <div className="confirm-box" role="alert">
                      <strong>Decline this submission?</strong>
                      <p>
                        The patient will see a declined status. No medical
                        ticket will be created.
                      </p>
                      <div className="button-row">
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={processTicket}
                          disabled={busy}
                        >
                          Confirm decline
                        </button>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => setConfirmReject(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="button button-primary" disabled={busy}>
                      {busy
                        ? "Saving…"
                        : nurse
                          ? priority === "10"
                            ? "Review decline"
                            : "Send to medical queue"
                          : "Call this patient"}
                      <Icon />
                    </button>
                  )}
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
