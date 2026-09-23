import ProtectedRoute from "./components/ProtectedRoute";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Homepage from "./components/Homepage";
import EDNavbar from "./components/EDNavbar";
import PatientWaiting from "./components/patientWaiting";
import NurseWaiting from "./components/nurseWaiting";
import EnterVirtualTriage from "./components/EnterVirtualTriage";
import DoctorWaiting from "./components/doctorWaiting";

function App() {
  return (
    <Router>
      <EDNavbar />
      <main id="main-content" className="shell" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/patientWaiting"
            element={
              <ProtectedRoute roles={[1]}>
                <PatientWaiting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurseWaiting"
            element={
              <ProtectedRoute roles={[2]}>
                <NurseWaiting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enter"
            element={
              <ProtectedRoute roles={[1]}>
                <EnterVirtualTriage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctorWaiting"
            element={
              <ProtectedRoute roles={[3]}>
                <DoctorWaiting />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="empty-state">
                <h1>Page not found</h1>
                <p>Let’s get you back to a familiar place.</p>
                <Link to="/" className="button button-primary">
                  Back to departments
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer shell">
        <span>
          <strong>mr.ed</strong> · Virtual triage, thoughtfully connected.
        </span>
        <span>Educational prototype · Fictional data only</span>
      </footer>
    </Router>
  );
}

export default App;
