/* eslint no-import-assign: 0 */  // --> OFF

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, act, fireEvent } from '@testing-library/react';

import Settings, { getServerSideProps } from '@/pages/settings';

import * as auth from '@/lib/authCheck';
import * as profile from '@/lib/profile';

describe('renders', () => {
  const username = 'test_username';
  const profileInfo = {
    name: 'test_name',
    description: 'test description'
  };

  const data = { 
    username,
    data: { props: { username, profileInfo } }
  };

  test('tabs', async () => {
    const response = await Settings(data);
    render(response);

    expect(screen.getByRole('tab', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Delete' })).toBeInTheDocument();

    const passwordForms = screen.getAllByLabelText('Password:');
    expect(passwordForms).toHaveLength(3);
  });

  test('profile tab', async () => {
    const response = await Settings(data);
    render(response);

    const nameForm = screen.getByRole('textbox', { name: 'Name:' });
    const descriptionForm = screen.getByRole('textbox', { name: 'Description:' });

    expect(nameForm.value).toBe(profileInfo.name);
    expect(descriptionForm.value).toBe(profileInfo.description);
    
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Description:')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Update Profile Info' })).toBeInTheDocument();
  });

  test('account tab', async () => {
    const response = await Settings(data);
    render(response);

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: 'Account' }));
    });

    expect(screen.getByLabelText('New Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password:')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Change Username' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
  });

  test('delete tab', async () => {
    const response = await Settings(data);
    render(response);

    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: 'Delete' }));
    });

    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeInTheDocument();
  });
});

describe('getServerSideProps', () => {
  test('test', async () => {
    const username = 'test_username';
    const profileInfo = {
      username,
      name: 'test_name',
      description: 'test description'
    };

    auth.authCheck = jest.fn().mockReturnValueOnce(username);
    profile.getNameAndDescription = jest.fn().mockReturnValueOnce(profileInfo);

    const response = await getServerSideProps();
    const data = { props: { username, data: { props: { username, profileInfo } } } };

    expect(response).toEqual(data);
  });
});
