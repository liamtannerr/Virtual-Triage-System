import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import Login from './Login';
import api, { rememberUser } from '../api';

vi.mock('../api', () => ({ default: { post: vi.fn() }, rememberUser: vi.fn() }));
afterEach(cleanup);

test('password is masked and login stores only the returned profile', async () => {
  const profile = { email: 'patient@example.com', name: 'Patient', user_type: 1, inTriage: 'false' };
  api.post.mockResolvedValue({ data: profile });
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Login /></MemoryRouter>);
  expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  await userEvent.type(screen.getByLabelText('Email'), profile.email);
  await userEvent.type(screen.getByLabelText('Password'), 'A long test password');
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(api.post).toHaveBeenCalledWith('/auth/login', { email: profile.email, password: 'A long test password' });
  expect(rememberUser).toHaveBeenCalledWith(profile);
});
