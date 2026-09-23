import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import api from '../api';

vi.mock('../api', () => ({ default: { get: vi.fn() }, rememberUser: vi.fn() }));
beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); });
afterEach(cleanup);

function showRoute() {
  render(<MemoryRouter initialEntries={['/staff']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      <Route path="/staff" element={<ProtectedRoute roles={[2]}><p>Private staff records</p></ProtectedRoute>} />
      <Route path="/login" element={<p>Login required</p>} />
    </Routes>
  </MemoryRouter>);
}

test('forged local role cannot reveal a protected screen', async () => {
  localStorage.setItem('user_type', '2');
  api.get.mockResolvedValue({ data: { user_type: 1 } });
  showRoute();
  expect(await screen.findByText(/do not have permission/)).toBeInTheDocument();
  expect(screen.queryByText('Private staff records')).not.toBeInTheDocument();
});

test('expired sessions go to login', async () => {
  api.get.mockRejectedValue({ response: { status: 401 } });
  showRoute();
  expect(await screen.findByText('Login required')).toBeInTheDocument();
});

test('staff access is granted after the server confirms the role', async () => {
  api.get.mockResolvedValue({ data: { user_type: 2 } });
  showRoute();
  expect(await screen.findByText('Private staff records')).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith('/auth/user');
});

test('server failure does not expose the protected screen', async () => {
  api.get.mockRejectedValue({ response: { status: 503 } });
  showRoute();
  expect(await screen.findByText(/Unable to check your session/)).toBeInTheDocument();
  expect(screen.queryByText('Private staff records')).not.toBeInTheDocument();
});
