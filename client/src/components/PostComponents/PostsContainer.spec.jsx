import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import { render, screen, fireEvent } from '@testing-library/react';

import PostsContainer from './PostsContainer';

const createPostsContainer = (total, prev, next, fn) => {
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

  return { 
    state: { 
      posts: arr,
      prevButtonDisabled: prev,
      nextButtonDisabled: next
    },
    pageNav: fn
  };
};

describe('renders posts component', () => {
  test('posts length = 0', () => {
    const data = createPostsContainer(0);
    const component = render(<PostsContainer {...data} /> );
    
    expect(component.container).not.toHaveTextContent('test_name');
    expect(component.container).not.toHaveTextContent('test_post');

    expect(component.container).toHaveTextContent('No posts here.');

    expect(screen.queryByRole('link', { name: 'test_date1' })).not.toBeInTheDocument();
  });

  test('posts length = 1', () => {
    const data = createPostsContainer(1);
    const component = render(<PostsContainer {...data} /> );

    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post1');
    expect(component.container).not.toHaveTextContent('test_post2');

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
  });

  test('posts length > 1', () => {
    const data = createPostsContainer(2);
    const component = render(<PostsContainer {...data} /> );

    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post1');
    expect(component.container).toHaveTextContent('test_post2');
    expect(component.container).not.toHaveTextContent('test_post3');

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date2' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'test_date3' })).not.toBeInTheDocument();
  });

  test('posts length > 10', () => {
    const data = createPostsContainer(11);
    const component = render(<PostsContainer {...data} /> );

    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post1');
    expect(component.container).toHaveTextContent('test_post10');
    expect(component.container).not.toHaveTextContent('test_post11');

    expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date10' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'test_date11' })).not.toBeInTheDocument();
  });
});

describe('testing buttons', () => {
  test('both buttons enabled', () => {
    const fn = jest.fn();
    const data = createPostsContainer(10, false, false, fn);
    const component = render(<PostsContainer {...data} /> );

    expect(component.container).toHaveTextContent('‹');
    expect(component.container).toHaveTextContent('›');

    expect(fn).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('prev');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith('next');

    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  test('both buttons disabled', () => {
    const fn = jest.fn();
    const data = createPostsContainer(10, true, true, fn);
    const component = render(<PostsContainer {...data} /> );

    expect(component.container).toHaveTextContent('‹');
    expect(component.container).toHaveTextContent('›');

    expect(fn).toHaveBeenCalledTimes(0);

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });
});

