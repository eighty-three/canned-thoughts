import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import { render, screen } from '@testing-library/react';

import Post from './Post';

describe('renders', () => {
  const data = {
    username: 'test_username',
    name: 'test_name',
    post: 'test_post',
    date: 'test_date',
    url: 'test_url',
  };

  test('no tags passed', () => {
    const component = render(
      <Post 
        {...data}
      />
    );
    
    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post');

    expect(component.container).not.toHaveTextContent('TAGS:');

    expect(screen.getByRole('link', { name: '@test_username' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date' })).toBeInTheDocument();
  });

  test('tags length = 0', () => {
    const tags = [];
    const component = render(
      <Post 
        {...data}
        tags={tags}
      />
    );

    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post');

    expect(component.container).not.toHaveTextContent('TAGS:');

    expect(screen.getByRole('link', { name: '@test_username' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date' })).toBeInTheDocument();
  });

  test('tags length = 1', () => {
    const tags = ['tag1'];
    const component = render(
      <Post 
        {...data}
        tags={tags}
      />
    );

    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post');

    expect(component.container).toHaveTextContent('TAGS: tag1');

    expect(screen.getByRole('link', { name: 'tag1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '@test_username' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date' })).toBeInTheDocument();
  });

  test('tags length > 1', () => {
    const tags = ['tag2', 'tag3'];
    const component = render(
      <Post 
        {...data}
        tags={tags}
      />
    );

    expect(component.container).toHaveTextContent('test_name');
    expect(component.container).toHaveTextContent('test_post');

    expect(component.container).not.toHaveTextContent('TAGS: tag1');
    expect(component.container).toHaveTextContent('TAGS: tag2, tag3');

    expect(screen.queryByRole('link', { name: 'tag1' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'tag2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'tag3' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '@test_username' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'test_date' })).toBeInTheDocument();
  });
});
