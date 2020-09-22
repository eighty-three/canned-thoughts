import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import { render, screen } from '@testing-library/react';

import Navbar from './Navbar';

describe('renders navbar component', () => {
  test('with username (logged in)', () => {
    const data = { username: 'test_username' };
    const component = render(<Navbar {...data} /> );
    
    expect(component.container).toHaveTextContent(`Logged in as ${data.username}`);

    expect(screen.getByRole('link', { name: data.username })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore' })).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Signup' })).not.toBeInTheDocument();
  });

  test('with redirect', () => {
    const data = { redirect: 'test_url' };
    const component = render(<Navbar {...data} /> );

    expect(component.container).not.toHaveTextContent('Logged in as');

    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Explore' })).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Signup' })).toBeInTheDocument();

    expect(component.container.querySelector('a')).toHaveAttribute('href', `/login?redirect=${data.redirect}`);
  });

  test('empty data', () => {
    const data = {};
    const component = render(<Navbar {...data} /> );

    expect(component.container).not.toHaveTextContent('Logged in as');

    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Explore' })).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Signup' })).toBeInTheDocument();

    expect(component.container.querySelector('a')).toHaveAttribute('href', '/login');
    expect(component.container.querySelector('a')).not.toHaveAttribute('href', `/login?redirect=${data.redirect}`);
  });
});
