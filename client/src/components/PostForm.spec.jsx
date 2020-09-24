/* eslint no-import-assign: 0 */  // --> OFF

import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PostForm from './PostForm';

import * as content from '@/lib/content';

describe('component', () => {
  const mockFn = jest.fn();
  const data = {
    username: 'test_username',
    addToPosts: mockFn,
    currentPosts: []
  };

  test('renders', () => {
    const { getByLabelText } = render(<PostForm {...data} />);
    const postInput = getByLabelText('Write your canned thought:');
    const tagInput = getByLabelText('Tags (optional):');

    expect(postInput.value).toEqual('');
    expect(tagInput.value).toEqual('');

    expect(postInput).toBeTruthy();
    expect(tagInput).toBeTruthy();

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  test('text input works', async () => {
    const { getByLabelText } = render(<PostForm {...data} />);
    const postInput = getByLabelText('Write your canned thought:');
    const tagInput = getByLabelText('Tags (optional):');

    expect(postInput.value).toEqual('');
    expect(tagInput.value).toEqual('');

    await act(async () => {
      await userEvent.type(postInput, 'testing post');
      await userEvent.type(tagInput, 'testing tags');
    });

    expect(postInput.value).toEqual('testing post');
    expect(tagInput.value).toEqual('testing tags');
  });

  test('submit works, no error', async () => {
    content.createPost = jest.fn().mockResolvedValue({ message: 'success' });
    const { getByLabelText, getByRole } = render(<PostForm {...data} />);
    const postInput = getByLabelText('Write your canned thought:');
    const tagInput = getByLabelText('Tags (optional):');
    const submitButton = getByRole('button', { name: 'Submit' });

    expect(postInput.value).toEqual('');
    expect(tagInput.value).toEqual('');

    await act(async () => {
      await userEvent.type(postInput, 'testing post');
      await userEvent.type(tagInput, 'testing tags');
      fireEvent.click(submitButton);
    });

    expect(content.createPost).toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  test('submit works, error is returned', async () => {
    content.createPost = jest.fn().mockResolvedValue({ error: 'fail' });
    const { getByLabelText, getByRole } = render(<PostForm {...data} />);
    const postInput = getByLabelText('Write your canned thought:');
    const tagInput = getByLabelText('Tags (optional):');
    const submitButton = getByRole('button', { name: 'Submit' });

    expect(postInput.value).toEqual('');
    expect(tagInput.value).toEqual('');

    await act(async () => {
      await userEvent.type(postInput, 'testing post');
      await userEvent.type(tagInput, 'testing tags');
      fireEvent.click(submitButton);
    });

    expect(content.createPost).toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'fail' })).toBeInTheDocument();
  });

  test('error with post', async () => {
    content.createPost = jest.fn().mockResolvedValue({ message: 'success' });
    const postError =  'Invalid characters or length (max 250). Try again';
    const { getByLabelText, getByRole, container } = render(<PostForm {...data} />);
    const postInput = getByLabelText('Write your canned thought:');
    const submitButton = getByRole('button', { name: 'Submit' });

    await act(async () => {
      await userEvent.type(postInput, 'testing post|');
      fireEvent.click(submitButton);
    });

    expect(content.createPost).not.toHaveBeenCalled();

    expect(container).toHaveTextContent(postError);
  });

  test('error with tags (characters/length)', async () => {
    content.createPost = jest.fn().mockResolvedValue({ message: 'success' });
    const tagErrorChars = 'Letters and numbers only, max 100 characters. Try again';
    const tagErrorUnique = '3 unique tags at most!';
    const { getByLabelText, getByRole, container } = render(<PostForm {...data} />);
    const tagInput = getByLabelText('Tags (optional):');
    const submitButton = getByRole('button', { name: 'Submit' });

    await act(async () => {
      await userEvent.type(tagInput, 'tag|');
      fireEvent.click(submitButton);
    });

    expect(content.createPost).not.toHaveBeenCalled();

    expect(container).toHaveTextContent(tagErrorChars);
    expect(container).not.toHaveTextContent(tagErrorUnique);
  });

  test('error with tags (unique)', async () => {
    content.createPost = jest.fn().mockResolvedValue({ message: 'success' });
    const tagErrorChars = 'Letters and numbers only, max 100 characters. Try again';
    const tagErrorUnique = '3 unique tags at most!';
    const { getByLabelText, getByRole, container } = render(<PostForm {...data} />);
    const tagInput = getByLabelText('Tags (optional):');
    const submitButton = getByRole('button', { name: 'Submit' });

    await act(async () => {
      await userEvent.type(tagInput, 'tag tag');
      fireEvent.click(submitButton);
    });

    expect(content.createPost).not.toHaveBeenCalled();

    expect(container).not.toHaveTextContent(tagErrorChars);
    expect(container).toHaveTextContent(tagErrorUnique);
  });
});
