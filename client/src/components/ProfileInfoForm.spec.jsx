/* eslint no-import-assign: 0 */  // --> OFF

import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ProfileInfoForm from './ProfileInfoForm';

import * as profile from '@/lib/profile';

describe('component', () => {
  const data = {
    name: 'test_name',
    description: 'test description',
    username: 'test_username'
  };

  test('renders', () => {
    const { getByLabelText } = render(<ProfileInfoForm {...data} />);
    const nameInput = getByLabelText('Name:');
    const descInput = getByLabelText('Description:');

    expect(nameInput.value).toEqual(data.name);
    expect(descInput.value).toEqual(data.description);

    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Description:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Profile Info' })).toBeInTheDocument();
  });

  test('text input works', async () => {
    const { getByLabelText } = render(<ProfileInfoForm {...data} />);
    const nameInput = getByLabelText('Name:');
    const descInput = getByLabelText('Description:');

    expect(nameInput.value).toEqual(data.name);
    expect(descInput.value).toEqual(data.description);

    await act(async () => {
      await userEvent.type(nameInput, ' testing input');
      await userEvent.type(descInput, ' testing input');
    });

    expect(nameInput.value).toEqual(`${data.name} testing input`);
    expect(descInput.value).toEqual(`${data.description} testing input`);
  });

  test('submit works, no error', async () => {
    profile.updateProfileInfo = jest.fn().mockResolvedValue({ message: 'success' });
    const { getByRole, getByLabelText } = render(<ProfileInfoForm {...data} />);
    const nameInput = getByLabelText('Name:');
    const descInput = getByLabelText('Description:');
    const submitButton = getByRole('button', { name: 'Update Profile Info' });

    expect(screen.getByRole('button', { name: 'Update Profile Info' })).toBeInTheDocument();

    await act(async () => {
      await userEvent.type(nameInput, ' testing input');
      await userEvent.type(descInput, ' testing input');
      fireEvent.click(submitButton);
    });

    expect(profile.updateProfileInfo).toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'success' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Update Profile Info' })).not.toBeInTheDocument();
  });

  test('submit works, error', async () => {
    profile.updateProfileInfo = jest.fn().mockResolvedValue({ message: 'success' });
    const nameError =  'Invalid characters or length (max 50). Try again';
    const descError =  'Invalid characters or length (max 150). Try again';

    const { getByRole, getByLabelText, container } = render(<ProfileInfoForm {...data} />);
    const nameInput = getByLabelText('Name:');
    const descInput = getByLabelText('Description:');
    const submitButton = getByRole('button', { name: 'Update Profile Info' });

    expect(screen.getByRole('button', { name: 'Update Profile Info' })).toBeInTheDocument();

    await act(async () => {
      await userEvent.type(nameInput, ' testing input |');
      await userEvent.type(descInput, ' testing input |');
      fireEvent.click(submitButton);
    });

    expect(profile.updateProfileInfo).not.toHaveBeenCalled();

    expect(screen.queryByRole('button', { name: 'success' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Profile Info' })).toBeInTheDocument();

    expect(container).toHaveTextContent(`Name:${nameError}`);
    expect(container).toHaveTextContent(`Description:${descError}`);
  });
});
