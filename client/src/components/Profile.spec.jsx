/* eslint no-import-assign: 0 */  // --> OFF

import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, fireEvent, act } from '@testing-library/react';

import * as follows from '@/lib/follows';

import Profile from './Profile';

describe('renders', () => {
  test('without loggedInUsername', () => {
    const data = {
      username: 'test1', 
      name: 'test_name',
      description: 'test description',
      followers: 5,
      followStatus: false
    };

    render(<Profile {...data} />);
    expect(screen.getByText('test1')).toBeInTheDocument();
    expect(screen.getByText('test_name')).toBeInTheDocument();
    expect(screen.getByText('test description')).toBeInTheDocument();
    expect(screen.getByText('Followers: 5')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unfollow' })).not.toBeInTheDocument();
  });

  test('with loggedInUsername and not following', async () => {
    const data = {
      username: 'test1', 
      name: 'test_name',
      description: 'test description',
      followers: 5,
      loggedInUsername: 'test2',
      followStatus: false
    };

    render(<Profile {...data} />);
    expect(screen.getByText('test1')).toBeInTheDocument();
    expect(screen.getByText('test_name')).toBeInTheDocument();
    expect(screen.getByText('test description')).toBeInTheDocument();
    expect(screen.getByText('Followers: 5')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unfollow' })).not.toBeInTheDocument();

    follows.toggleFollowStatus = jest.fn().mockResolvedValue({ message: 'success' });
    const followButton = screen.getByRole('button', { name: 'Follow' });

    await act(async () => {
      fireEvent.click(followButton);
    });

    expect(follows.toggleFollowStatus).toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'Unfollow' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();

    expect(screen.getByText('Followers: 6')).toBeInTheDocument();
  });

  test('with loggedInUsername and following', async () => {
    const data = {
      username: 'test1', 
      name: 'test_name',
      description: 'test description',
      followers: 5,
      loggedInUsername: 'test2',
      followStatus: true
    };

    render(<Profile {...data} />);
    expect(screen.getByText('test1')).toBeInTheDocument();
    expect(screen.getByText('test_name')).toBeInTheDocument();
    expect(screen.getByText('test description')).toBeInTheDocument();
    expect(screen.getByText('Followers: 5')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Unfollow' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();

    follows.toggleFollowStatus = jest.fn().mockResolvedValue({ message: 'success' });
    const followButton = screen.getByRole('button', { name: 'Unfollow' });

    await act(async () => {
      fireEvent.click(followButton);
    });

    expect(follows.toggleFollowStatus).toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unfollow' })).not.toBeInTheDocument();

    expect(screen.getByText('Followers: 4')).toBeInTheDocument();
  });

  test('with loggedInUsername same as username', () => {
    const data = {
      username: 'test1', 
      name: 'test_name',
      description: 'test description',
      followers: 5,
      loggedInUsername: 'test1',
      followStatus: false
    };

    render(<Profile {...data} />);
    expect(screen.getByText('test1')).toBeInTheDocument();
    expect(screen.getByText('test_name')).toBeInTheDocument();
    expect(screen.getByText('test description')).toBeInTheDocument();
    expect(screen.getByText('Followers: 5')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unfollow' })).not.toBeInTheDocument();
  });
});
