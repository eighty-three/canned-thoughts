import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import { render, screen } from '@testing-library/react';

import Posts from './Posts';

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
  test('posts length = 0', () => {
    const data = [];
    const component = render(<Posts posts={data} /> );
    
    expect(component.container).not.toHaveTextContent('test_name');
    expect(component.container).not.toHaveTextContent('test_post');

    expect(component.container).toHaveTextContent('No posts here.');

    expect(screen.queryByRole('link', { name: 'test_date1' })).not.toBeInTheDocument();
  });

  test('posts length = 1', () => {
    const data = createPosts(1);
    const component = render(<Posts posts={data} /> );

    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post1');
    expect(component.container).not.toHaveTextContent('test_post2');

    expect(component.container).not.toHaveTextContent('TAGS:');

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
  });

  test('posts length > 1', () => {
    const data = createPosts(2);
    const component = render(<Posts posts={data} /> );

    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post1');
    expect(component.container).toHaveTextContent('test_post2');
    expect(component.container).not.toHaveTextContent('test_post3');

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date2' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'test_date3' })).not.toBeInTheDocument();
  });

  test('posts length > 10', () => {
    const data = createPosts(11);
    const component = render(<Posts posts={data} /> );

    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post1');
    expect(component.container).toHaveTextContent('test_post10');
    expect(component.container).not.toHaveTextContent('test_post11');

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date10' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'test_date11' })).not.toBeInTheDocument();
  });
});
