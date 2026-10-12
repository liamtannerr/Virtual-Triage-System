import React from "react";
import { Link } from "react-router-dom";
import useResource from "../hooks/useResource";
import { Icon, EmptyState, ErrorNotice, RefreshButton, waitLabel } from "./UI";

export default function Homepage() {
  const departments = useResource("/emergency/department", 30000, {
    checkReadiness: true,
  });
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A little clarity. A better starting point.</p>
          <h1>
            Your next step,
            <br />
            <span>made simpler.</span>
          </h1>
          <p>
            Explore departments, share your symptoms, and follow your place in
            the virtual queue. One clear step at a time.
          </p>
          <div className="button-row">
            <Link to="/enter" className="button button-primary">
              Start a submission <Icon />
            </Link>
            <a href="#how-it-works" className="button button-quiet">
              How it works <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="hero-note">
            <Icon name="shield" size={17} /> Educational demo · Not a clinical
            service
          </p>
        </div>
        <div className="journey-card">
          <div className="journey-title">
            <span className="icon-tile">
              <Icon name="list" />
            </span>
            <span>
              Your visit, at a glance
              <small>From first details to next steps</small>
            </span>
          </div>
          <ol className="journey-list">
            <li>
              <span>01</span>
              <div>
                <strong>Tell us what’s going on</strong>
                <p>Choose a department and share your symptoms.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>A nurse reviews your submission</strong>
                <p>Your information helps guide the next step.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Follow your progress</strong>
                <p>Check your waiting room for updates.</p>
              </div>
            </li>
          </ol>
          <div className="journey-bottom">
            <span className="status-dot" /> Designed around a clear handoff
          </div>
        </div>
      </section>
      <section aria-labelledby="department-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Find your starting point</p>
            <h2 id="department-heading">Emergency departments</h2>
            <p>
              Demo estimates based on the current virtual queue, refreshed every
              30 seconds.
            </p>
          </div>
          <RefreshButton resource={departments} />
        </div>
        {departments.error && (
          <ErrorNotice retry={departments.refresh}>
            {departments.error}
          </ErrorNotice>
        )}
        {departments.loading ? (
          <EmptyState loading title="Loading departments">
            Finding the latest queue estimates… This may take a minute while the
            service starts.
          </EmptyState>
        ) : departments.data?.length ? (
          <div className="department-grid">
            {departments.data.map((department, index) => (
              <article
                className="department-card"
                key={department.establishmentID}
              >
                <div className="department-top">
                  <span className="icon-tile">
                    <Icon name="building" size={25} />
                  </span>
                  <span className="tag">
                    DEPARTMENT {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3>{department.name}</h3>
                <p className="department-address">{department.address}</p>
                <div className="wait-block">
                  <div>
                    <span className="muted-label">Estimated wait</span>
                    <strong>{waitLabel(department.currentLoad)}</strong>
                  </div>
                  <span className="queue-count">
                    <Icon name="clock" size={16} /> {department.currentLoad} in
                    queue
                  </span>
                </div>
                <Link
                  to={`/enter?department=${department.establishmentID}`}
                  className="department-link"
                >
                  Choose this department <Icon />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          !departments.error && (
            <EmptyState title="No departments available">
              Please check back soon or refresh the list.
            </EmptyState>
          )
        )}
        {departments.updatedAt && (
          <p className="update-note">
            Last updated{" "}
            {departments.updatedAt.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
            . Estimates are illustrative, not live hospital wait times.
          </p>
        )}
      </section>
      <section id="how-it-works" className="how-section">
        <div>
          <p className="eyebrow">Built to keep you informed</p>
          <h2>
            A clear path through
            <br />
            the waiting process.
          </h2>
        </div>
        <div className="how-grid">
          {[
            [
              "01",
              "Share the details",
              "A guided form keeps your symptoms and history together.",
            ],
            [
              "02",
              "Get a review",
              "The nurse view turns a submission into a prioritized ticket.",
            ],
            [
              "03",
              "See what’s next",
              "Your waiting room shows queue and doctor-call updates.",
            ],
          ].map(([number, title, text]) => (
            <div key={number}>
              <span className="step-number">{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
