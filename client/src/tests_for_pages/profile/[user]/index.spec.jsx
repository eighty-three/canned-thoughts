/* eslint no-import-assign: 0 */  // --> OFF

import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, act, fireEvent } from '@testing-library/react';

import ProfilePage, { getServerSideProps } from '@/pages/profile/[user]/index';

import * as auth from '@/lib/authCheck';
import * as content from '@/lib/content';
import * as profile from '@/lib/profile';

import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}));

const createPosts = (total) => {
  const arr = [];
  for (let i = 1; i < total + 1; i++) {
    arr.push({
      username: 'test_username',
      name: 'test_name',
      post: `test_post${i}`,
      date: `test_date${i}`,
      url: `test_url${i}`,
    });
  }

  return arr;
};

describe('renders', () => {
  const profileInfo = {
    username: 'test_username', 
    name: 'test_name',
    description: 'test description',
    followers: 5,
    followStatus: true
  };

  test('with error', async () => {
    const data = {
      error: 'Profile not found'
    };
  
    render(<ProfilePage {...data} />);

    expect(screen.getByText('Profile not found')).toBeInTheDocument();
  });

  test('posts length = 0', () => {
    const posts = createPosts(0);
    const data = {
      username: 'my_username',
      profileInfo,
      profileUsername: profileInfo.username,
      posts,
      page: 1
    };

    const component = render(<ProfilePage {...data} /> );

    expect(component.container).toHaveTextContent('No posts here.');

    expect(screen.queryByRole('link', { name: 'test_date1' })).not.toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  test('posts length = 1', () => {
    const posts = createPosts(1);
    const data = {
      username: 'my_username',
      profileInfo,
      profileUsername: profileInfo.username,
      posts,
      page: 1
    };

    const component = render(<ProfilePage {...data} /> );

    expect(component.container).not.toHaveTextContent('No posts here.');
    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  test('posts length > 10', () => {
    const posts = createPosts(11);
    const data = {
      username: 'my_username',
      profileInfo,
      profileUsername: profileInfo.username,
      posts,
      page: 1
    };

    const component = render(<ProfilePage {...data} /> );

    expect(component.container).not.toHaveTextContent('No posts here.');
    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date10' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'test_date11' })).not.toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  test('posts length > 10, page 2', () => {
    const posts = createPosts(11);
    const data = {
      username: 'my_username',
      profileInfo,
      profileUsername: profileInfo.username,
      posts,
      page: 2
    };

    const component = render(<ProfilePage {...data} /> );

    expect(component.container).not.toHaveTextContent('No posts here.');
    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date10' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'test_date11' })).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });
});

describe('page nav works', () => {
  const profileInfo = {
    username: 'test_username', 
    name: 'test_name',
    description: 'test description',
    followers: 5,
    followStatus: true
  };
  const mockRouter = { push: jest.fn() };
  useRouter.mockReturnValue(mockRouter);
  window.scrollTo = jest.fn();

  test('from page 1, returns x > 10 posts', async () => {
    content.getPosts = jest.fn().mockResolvedValue(createPosts(5));
    const posts = createPosts(11);
    const data = {
      username: 'my_username',
      profileInfo,
      profileUsername: profileInfo.username,
      posts,
      page: 1
    };

    render(<ProfilePage {...data} /> );

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();

    content.getPosts = jest.fn().mockResolvedValue(createPosts(11));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    });

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  test('from page 1, returns x < 11 posts', async () => {
    content.getPosts = jest.fn().mockResolvedValue(createPosts(11));
    const posts = createPosts(11);
    const data = {
      username: 'my_username',
      profileInfo,
      profileUsername: profileInfo.username,
      posts,
      page: 1
    };

    render(<ProfilePage {...data} /> );

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();

    content.getPosts = jest.fn().mockResolvedValue(createPosts(5));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  test('from page 2 to page 1', async () => {
    content.getPosts = jest.fn().mockResolvedValue(createPosts(11));
    const posts = createPosts(5);
    const data = {
      username: 'my_username',
      profileInfo,
      profileUsername: profileInfo.username,
      posts,
      page: 2
    };

    render(<ProfilePage {...data} /> );

    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    });

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();

    content.getPosts = jest.fn().mockResolvedValue(createPosts(5));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });
});

describe('getServerSideProps', () => {
  const username = 'test_username';

  content.getPosts = jest.fn();
  profile.getProfileInfo = jest.fn().mockReturnValue({ message: 'success' });
  auth.lightAuthCheck= jest.fn().mockReturnValue(username);
  test('null page', async () => {
    const ctx = {
      params: {
        user: 'test_profile'
      },
      query: {}
    };

    const response = await getServerSideProps(ctx);

    expect(response.props).toEqual(
      expect.objectContaining({
        profileUsername: ctx.params.user,
        page: 1
      })
    );
  });

  test('page = 0', async () => {
    const ctx = {
      params: {
        user: 'test_profile'
      },
      query: {
        page: 0
      }
    };

    const response = await getServerSideProps(ctx);

    expect(response.props).toEqual(
      expect.objectContaining({
        profileUsername: ctx.params.user,
        page: 1
      })
    );
  });

  test('page = 1', async () => {
    const ctx = {
      params: {
        user: 'test_profile'
      },
      query: {
        page: 1
      }
    };

    const response = await getServerSideProps(ctx);

    expect(response.props).toEqual(
      expect.objectContaining({
        profileUsername: ctx.params.user,
        page: ctx.query.page
      })
    );
  });

  test('page > 1', async () => {
    const ctx = {
      params: {
        user: 'test_profile'
      },
      query: {
        page: 3
      }
    };

    const response = await getServerSideProps(ctx);

    expect(response.props).toEqual(
      expect.objectContaining({
        profileUsername: ctx.params.user,
        page: ctx.query.page
      })
    );
  });
});
