import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import api from "../api";
import Homepage from "./Homepage";

vi.mock("../api", () => ({ default: { get: vi.fn() } }));

const ready = { data: { message: "Virtual Triage API" } };
const departments = { data: [{
  establishmentID: 42,
  name: "Example Emergency Department",
  address: "1 Example Street",
  currentLoad: 5,
}] };

beforeEach(() => {
  vi.useFakeTimers();
  api.get.mockReset();
  api.get.mockImplementation(async (path) => path === "/" ? ready : departments);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

async function mountHomepage() {
  let view;
  await act(async () => {
    view = render(<MemoryRouter><Homepage /></MemoryRouter>);
  });
  return view;
}

test("a warm backend loads immediately and subsequent polling skips readiness checks", async () => {
  await mountHomepage();
  expect(api.get.mock.calls.map(([path]) => path)).toEqual(["/", "/emergency/department"]);
  expect(screen.getByText("1h 15m")).toBeInTheDocument();
  await act(() => vi.advanceTimersByTimeAsync(30000));
  expect(api.get.mock.calls.map(([path]) => path)).toEqual(["/", "/emergency/department", "/emergency/department"]);
});

test.each([undefined, 502, 503, 504])("startup failure (%s) keeps loading and recovers without a click", async (status) => {
  api.get.mockRejectedValueOnce({ response: { status } });
  await mountHomepage();
  expect(screen.getByText("Loading departments")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(api.get).toHaveBeenCalledTimes(1);
  await act(() => vi.advanceTimersByTimeAsync(3000));
  expect(screen.getByText("1h 15m")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(api.get.mock.calls.map(([path]) => path)).toEqual(["/", "/", "/emergency/department"]);
});

test("a host startup page does not release the department request", async () => {
  api.get.mockResolvedValueOnce({ data: "<html>Starting service</html>" });
  await mountHomepage();
  expect(api.get).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Loading departments")).toBeInTheDocument();
  await act(() => vi.advanceTimersByTimeAsync(3000));
  expect(screen.getByText("1h 15m")).toBeInTheDocument();
});

test("a minute-long cold start tolerates request timeouts without overlapping polls", async () => {
  api.get.mockImplementation((path, { timeout }) => {
    if (path !== "/") return Promise.resolve(departments);
    return new Promise((resolve, reject) => setTimeout(() => reject(new Error("Timeout")), timeout));
  });
  await mountHomepage();
  await act(() => vi.advanceTimersByTimeAsync(60000));
  expect(api.get).toHaveBeenCalledTimes(5);
  expect(api.get.mock.calls.every(([path]) => path === "/")).toBe(true);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  api.get.mockImplementation(async (path) => path === "/" ? ready : departments);
  await act(() => vi.advanceTimersByTimeAsync(5000));
  expect(screen.getByText("1h 15m")).toBeInTheDocument();
});

test("persistent startup failure eventually offers a working manual retry", async () => {
  api.get.mockRejectedValue({ response: { status: 503 } });
  await mountHomepage();
  await act(() => vi.advanceTimersByTimeAsync(120000));
  expect(screen.getByRole("alert")).toHaveTextContent("We couldn’t load");
  expect(api.get.mock.calls.every(([path]) => path === "/")).toBe(true);
  api.get.mockImplementation(async (path) => path === "/" ? ready : departments);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Try again" })));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByText("1h 15m")).toBeInTheDocument();
});

test("authentication errors are shown immediately instead of retried as startup failures", async () => {
  api.get.mockRejectedValue({ response: { status: 401 } });
  await mountHomepage();
  expect(screen.getByRole("alert")).toHaveTextContent("Your session has ended");
  await act(() => vi.advanceTimersByTimeAsync(3000));
  expect(api.get).toHaveBeenCalledTimes(1);
});

test("leaving during startup cancels the request signal and pending retry", async () => {
  api.get.mockRejectedValue({ response: { status: 503 } });
  const view = await mountHomepage();
  const signal = api.get.mock.calls[0][1].signal;
  view.unmount();
  expect(signal.aborted).toBe(true);
  await act(() => vi.advanceTimersByTimeAsync(120000));
  expect(api.get).toHaveBeenCalledTimes(1);
});
