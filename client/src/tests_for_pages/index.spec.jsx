/* eslint no-import-assign: 0 */  // --> OFF

import * as React from 'react';

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, act, fireEvent } from '@testing-library/react';

import LandingPage, { getServerSideProps } from '@/pages/index';

import * as auth from '@/lib/authCheck';

import * as Router from 'next/router';

describe('renders', () => {
  describe('login/signup', () => { // Literally the same
    const mockUseEffect = jest.spyOn(React, 'useEffect');
    Router.useRouter = jest.fn().mockReturnValue({ pathname: null });
    
    afterEach(() => {
      mockUseEffect.mockRestore();
    });
    
    test('with username', async () => {
      mockUseEffect.mockImplementation(null);
      const data = { username: 'test_username', data: { props: { username: 'test_username' } } } ;
      const response = await LandingPage(data);
      render(response);
    
      expect(mockUseEffect).toHaveBeenCalledTimes(1); // Did a redirect
    
      expect(screen.queryByRole('button', { name: 'Log in' })).not.toBeInTheDocument();
      expect(screen.getByText('Already logged in')).toBeInTheDocument();
    });
    
    test('without username', async () => {
      const data = { username: null, data: { props: { username: null } } } ;
      const response = await LandingPage(data);
      const component = render(response);
    
      expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    
      expect(component.container.querySelectorAll('input')[0]).toHaveAttribute('type', 'text');
      expect(component.container.querySelectorAll('input')[1]).toHaveAttribute('type', 'password');
    });
  });

  describe('all', () => {
    test('texts', async () => {
      const data = { username: null, data: { props: { username: null } } } ;
      const response = await LandingPage(data);
      render(response);
      
      const flavor = 'adj: lacking originality or individuality as if mass-produced';
      expect(screen.getByRole('link', { name: flavor })).toBeInTheDocument();
      
      const helpText = 'Don\'t have an account yet?';
      expect(screen.getByRole('link', { name: helpText })).toBeInTheDocument();

      expect(screen.getByText('Canned Thoughts')).toBeInTheDocument();
    });
  });
});

describe('switch modes', () => {
  test('works', async () => {
    const data = { username: null, data: { props: { username: null } } } ;
    const response = await LandingPage(data);
    render(response);

    const helpText = 'Don\'t have an account yet?';
    const newHelpText = 'Already have an account?';
    let changeMode = screen.getByRole('link', { name: helpText });

    await act(async () => {
      fireEvent.click(changeMode);
    });

    expect(screen.queryByRole('link', { name: helpText })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: newHelpText })).toBeInTheDocument();

    changeMode = screen.getByRole('link', { name: newHelpText });

    await act(async () => {
      fireEvent.click(changeMode);
    });

    expect(screen.getByRole('link', { name: helpText })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: newHelpText })).not.toBeInTheDocument();
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
