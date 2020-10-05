/* eslint no-import-assign: 0 */  // --> OFF

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Dashboard, { getServerSideProps } from '@/pages/dashboard';

import * as auth from '@/lib/authCheck';
import * as content from '@/lib/content';

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
  const username = 'test_username';
  const posts = createPosts(10);

  const data = { 
    username,
    data: { props: { username, posts } }
  };

  test('works', async () => {
    const response = await Dashboard(data);
    render(response);

    expect(screen.getByLabelText('Write your canned thought:')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags (optional):')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date10' })).toBeInTheDocument();
  });
});

describe('creating post', () => {
  const username = 'test_username';
  const posts = createPosts(10);

  const data = { 
    username,
    data: { props: { username, posts } }
  };

  test('works', async () => {
    content.createPost = jest.fn().mockResolvedValue(createPosts(11)[10]);
    const response = await Dashboard(data);
    const { getByLabelText, getByRole } = render(response);
    const postInput = getByLabelText('Write your canned thought:');
    const submitButton = getByRole('button', { name: 'Submit' });

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date10' })).toBeInTheDocument();

    await act(async () => {
      await userEvent.type(postInput, 'testing post');
      fireEvent.click(submitButton);
    });

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'test_date10' })).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'test_date11' })).toBeInTheDocument();
  });
});

describe('getServerSideProps', () => {
  test('test', async () => {
    const username = 'test_username';
    const posts = createPosts(10);

    auth.authCheck = jest.fn().mockReturnValueOnce(username);
    content.getDashboardPosts = jest.fn().mockReturnValueOnce(posts);

    const response = await getServerSideProps();
    const data = { props: { username, data: { props: { username, posts } } } };

    expect(response).toEqual(data);
  });
});
