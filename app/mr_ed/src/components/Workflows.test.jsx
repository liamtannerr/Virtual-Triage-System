import React from "react";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import api from "../api";
import Homepage from "./Homepage";
import EnterVirtualTriage from "./EnterVirtualTriage";
import StaffQueue from "./StaffQueue";
import { initialSymptoms } from "../symptoms";

vi.mock("../api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
const department = {
  establishmentID: 42,
  name: "Example Emergency Department",
  address: "1 Example Street",
  currentLoad: 5,
};
const ticket = {
  ...initialSymptoms(),
  ticketID: 123,
  patient: "Alex Example",
  email: "alex@example.com",
  ED: 42,
  timestamp: "2026-09-22T10:00:00Z",
  durationOfSymptoms: "Two days",
  listAllergies: "None",
  pastMedicalConditions: "None",
  substanceHabits: { alcohol: false, smoking: false, drugs: false },
  consent: true,
};
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  window.scrollTo = vi.fn();
  api.get.mockImplementation(async (path) => ({
    data: path === "/emergency/department" ? [department] : [ticket],
  }));
  api.post.mockResolvedValue({ data: {} });
  api.put.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });
});
afterEach(cleanup);

test("department errors can be retried and cards retain the selected department in their link", async () => {
  api.get.mockRejectedValueOnce(new Error("Offline"));
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "We couldn’t load",
  );
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("heading", { name: department.name }),
  ).toBeInTheDocument();
  expect(screen.getByText("1h 15m")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /Choose this department/ }),
  ).toHaveAttribute("href", "/enter?department=42");
});

test("intake preserves details across steps and submits independently grouped symptoms with consent", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/enter?department=42"]}>
      <Routes>
        <Route path="/enter" element={<EnterVirtualTriage />} />
        <Route
          path="/patientWaiting"
          element={<p>Waiting room destination</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByRole("option", { name: department.name });
  expect(screen.getByLabelText("Emergency department")).toHaveValue("42");
  await user.type(screen.getByLabelText(/How long/), "Two days");
  await user.type(screen.getByLabelText("Allergies"), "None");
  await user.type(screen.getByLabelText("Relevant medical history"), "None");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  const cardiovascular = screen.getByRole("group", { name: "Cardiovascular" });
  await user.click(within(cardiovascular).getByLabelText("Chest pain"));
  for (const name of [
    "Do you smoke?",
    "Do you consume alcohol?",
    "Do you use recreational drugs?",
  ]) {
    await user.click(
      within(screen.getByRole("group", { name })).getByLabelText("No"),
    );
  }
  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByLabelText(/How long/)).toHaveValue("Two days");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  expect(
    within(
      screen.getByRole("group", { name: "Cardiovascular" }),
    ).getByLabelText("Chest pain"),
  ).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.click(
    screen.getByRole("button", { name: "Submit to nurse queue" }),
  );
  expect(api.post).not.toHaveBeenCalled();
  await user.click(screen.getByRole("checkbox", { name: /I consent/ }));
  await user.click(
    screen.getByRole("button", { name: "Submit to nurse queue" }),
  );
  expect(
    await screen.findByText("Waiting room destination"),
  ).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledExactlyOnceWith("/triage/tickets", {
    ED: 42,
    durationOfSymptoms: "Two days",
    listAllergies: "None",
    pastMedicalConditions: "None",
    ...initialSymptoms(),
    cardiovascularSymptoms: {
      ...initialSymptoms().cardiovascularSymptoms,
      chestPain: true,
    },
    substanceHabits: { smoking: false, alcohol: false, drugs: false },
    consent: true,
  });
});

test("nurse must choose a priority before moving a submission into the medical queue", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <StaffQueue role="nurse" />
    </MemoryRouter>,
  );
  await user.click(await screen.findByRole("button", { name: /Alex Example/ }));
  await user.click(
    screen.getByRole("button", { name: "Send to medical queue" }),
  );
  expect(api.post).not.toHaveBeenCalled();
  await user.selectOptions(screen.getByLabelText("Review outcome"), "3");
  await user.click(
    screen.getByRole("button", { name: "Send to medical queue" }),
  );
  expect(await screen.findByText(/Review complete/)).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledExactlyOnceWith(
    "/triage/tickets/123/approve",
    { priority: 3 },
  );
  expect(api.put).not.toHaveBeenCalled();
  expect(api.delete).not.toHaveBeenCalled();
});

test("declining requires confirmation and never creates a medical ticket or increments load", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <StaffQueue role="nurse" />
    </MemoryRouter>,
  );
  await user.click(await screen.findByRole("button", { name: /Alex Example/ }));
  await user.selectOptions(screen.getByLabelText("Review outcome"), "10");
  await user.click(screen.getByRole("button", { name: "Review decline" }));
  expect(api.post).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Confirm decline" }));
  expect(await screen.findByText(/Submission declined/)).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledExactlyOnceWith(
    "/triage/tickets/123/decline",
  );
  expect(api.put).not.toHaveBeenCalled();
  expect(api.delete).not.toHaveBeenCalled();
});

test("doctor calls a patient with one request", async () => {
  api.get.mockImplementation(async (path) => ({
    data:
      path === "/emergency/department"
        ? [department]
        : [
            {
              VTticketID: 123,
              priority: 2,
              startTime: ticket.timestamp,
              VTTicket: ticket,
            },
          ],
  }));
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <StaffQueue role="doctor" />
    </MemoryRouter>,
  );
  await user.click(await screen.findByRole("button", { name: /Alex Example/ }));
  await user.click(screen.getByRole("button", { name: "Call this patient" }));
  expect(await screen.findByText(/Patient called/)).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledExactlyOnceWith("/medical/tickets/123/call");
  expect(api.put).not.toHaveBeenCalled();
  expect(api.delete).not.toHaveBeenCalled();
});

test("a failed review leaves the ticket selected and offers no success message", async () => {
  api.post.mockRejectedValueOnce(new Error("Database temporarily unavailable"));
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <StaffQueue role="nurse" />
    </MemoryRouter>,
  );
  await user.click(await screen.findByRole("button", { name: /Alex Example/ }));
  await user.selectOptions(screen.getByLabelText("Review outcome"), "3");
  await user.click(
    screen.getByRole("button", { name: "Send to medical queue" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Database temporarily unavailable",
  );
  expect(screen.getByLabelText("Review outcome")).toHaveValue("3");
  expect(screen.queryByText(/Review complete/)).not.toBeInTheDocument();
  expect(api.put).not.toHaveBeenCalled();
  expect(api.delete).not.toHaveBeenCalled();
});
