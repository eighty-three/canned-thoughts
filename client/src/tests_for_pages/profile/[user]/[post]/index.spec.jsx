import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen } from '@testing-library/react';

import Post from '@/pages/profile/[user]/[post]/index';

describe('renders', () => {
  test('with error', async () => {
    const data = {
      error: 'Post not found'
    };
  
    render(<Post {...data} />);

    expect(screen.getByText('Post not found')).toBeInTheDocument();
  });

  test('with no error', async () => {
    const postInfo = {
      username: 'profile_username',
      name: 'profile_name',
      post: 'test post',
      date: 'test date',
      tags: ['tag1', 'tag2', 'tag3'],
      url: 'test_url'
    };

    const data = {
      postInfo
    };
  
    const component = render(<Post {...data} />);

    expect(screen.getByText('test post')).toBeInTheDocument();
    expect(screen.getByText('profile_name')).toBeInTheDocument();
    expect(component.container).toHaveTextContent('TAGS: tag1, tag2, tag3');

    expect(screen.queryByText('Post not found')).not.toBeInTheDocument();
  });
});
