/* eslint no-import-assign: 0 */  // --> OFF

import * as React from 'react';

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LoginPage, { getServerSideProps } from '@/pages/login';

import * as auth from '@/lib/authCheck';

import * as Router from 'next/router';

import ky from 'ky-universal';
jest.mock('ky-universal');

describe('renders', () => {
  const mockUseEffect = jest.spyOn(React, 'useEffect');
  Router.useRouter = jest.fn().mockReturnValue({ pathname: null });

  afterEach(() => {
    mockUseEffect.mockRestore();
  });

  test('with username', async () => {
    mockUseEffect.mockImplementation(null);
    const data = { username: 'test_username', data: { props: { username: 'test_username' } } } ;
    const response = await LoginPage(data);
    render(response);

    expect(mockUseEffect).toHaveBeenCalledTimes(1); // Did a redirect

    expect(screen.queryByRole('button', { name: 'Log in' })).not.toBeInTheDocument();
    expect(screen.getByText('Already logged in')).toBeInTheDocument();
  });

  test('without username', async () => {
    const data = { username: null, data: { props: { username: null } } } ;
    const response = await LoginPage(data);
    const component = render(response);

    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();

    expect(component.container.querySelectorAll('input')[0]).toHaveAttribute('type', 'text');
    expect(component.container.querySelectorAll('input')[1]).toHaveAttribute('type', 'password');
  });
});

describe('test login', () => {
  const mockFn = jest.fn();

  Router.useRouter = jest.fn().mockReturnValue({ pathname: (path) => console.log(path) });
  Router.default.replace = mockFn;

  test('error', async () => {
    ky.post.mockImplementation(() => Promise.resolve({ 
      json: () => Promise.resolve({ error: 'Wrong password' })
    }));

    const data = { username: null, data: { props: { username: null } } } ;
    const response = await LoginPage(data);
    const component = render(response);

    const usernameInput = component.container.querySelectorAll('input')[0];
    const passwordInput = component.container.querySelectorAll('input')[1];

    const submitButton = screen.getByRole('button', { name: 'Log in' });

    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();

    await act(async () => {
      await userEvent.type(usernameInput, 'username');
      await userEvent.type(passwordInput, 'pw');
      fireEvent.click(submitButton);
    });

    expect(screen.queryByRole('button', { name: 'Log in' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wrong password' })).toBeInTheDocument();

    expect(mockFn).not.toHaveBeenCalled();
  });

  test('works', async () => {
    ky.post.mockImplementation(() => Promise.resolve({ 
      json: () => Promise.resolve({ message: 'Success' })
    }));

    const data = { username: null, data: { props: { username: null } } } ;
    const response = await LoginPage(data);
    const component = render(response);

    const usernameInput = component.container.querySelectorAll('input')[0];
    const passwordInput = component.container.querySelectorAll('input')[1];

    const submitButton = screen.getByRole('button', { name: 'Log in' });

    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();

    await act(async () => {
      await userEvent.type(usernameInput, 'username');
      await userEvent.type(passwordInput, 'pw');
      fireEvent.click(submitButton);
    });

    expect(mockFn).toHaveBeenCalledWith('/dashboard');
  });
});

describe('getServerSideProps', () => {
  test('test', async () => {
    const username = 'test_username';
    auth.authCheck = jest.fn().mockReturnValueOnce(username);

    const response = await getServerSideProps();
    const data = { props: { username, data: { props: { username } } } };

    expect(response).toEqual(data);
  });
});
