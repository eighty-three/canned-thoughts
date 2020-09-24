/* eslint no-import-assign: 0 */  // --> OFF

import React from 'react';

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchForm from './SearchForm';

import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}));

describe('component', () => {
  const mockFn = jest.fn();
  const data = {
    tags: 'test tags',
    setFormState: mockFn
  };

  const mockRouter = { push: jest.fn(), events: { on: jest.fn() }};
  useRouter.mockReturnValue(mockRouter);

  test('renders', () => {
    const { getByLabelText } = render(<SearchForm {...data} />);
    const tagInput = getByLabelText('Tags:');
    const userScopeAll = getByLabelText('All');
    const userScopeFollowed = getByLabelText('Followed Only');
    const userScopeSelf = getByLabelText('Self');
    const tagScopeInclusive = getByLabelText('Inclusive');
    const tagScopeExclusive = getByLabelText('Exclusive');

    expect(tagInput).toBeTruthy();
    expect(userScopeAll).toBeTruthy();
    expect(userScopeFollowed).toBeTruthy();
    expect(userScopeSelf).toBeTruthy();
    expect(tagScopeInclusive).toBeTruthy();
    expect(tagScopeExclusive).toBeTruthy();

    expect(tagInput.value).toEqual('test tags');
    expect(userScopeAll.value).toEqual('all');
    expect(userScopeFollowed.value).toEqual('followed');
    expect(userScopeSelf.value).toEqual('self');
    expect(tagScopeInclusive.value).toEqual('inclusive');
    expect(tagScopeExclusive.value).toEqual('exclusive');

    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  test('text input works', async () => {
    const { getByLabelText } = render(<SearchForm {...data} />);
    const tagInput = getByLabelText('Tags:');

    expect(tagInput.value).toEqual('test tags');

    await act(async () => {
      await userEvent.type(tagInput, ' testing');
    });

    expect(tagInput.value).toEqual(`${data.tags} testing`);
  });

  test('submit works, no error', async () => {
    /* An error on submit doesn't need to be tested because it only affects the
     * PostsContainer component, where it'll receive an empty array if
     * something went wrong (see /lib/content.js)
     */
    const { getByLabelText, getByRole } = render(<SearchForm {...data} />);
    const tagInput = getByLabelText('Tags:');
    const submitButton = getByRole('button', { name: 'Submit' });

    expect(tagInput.value).toEqual('test tags');

    await act(async () => {
      await userEvent.type(tagInput, ' testing');
      fireEvent.click(submitButton);
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/explore?tags=test,tags,testing&userScope=all&tagScope=inclusive&page=1'
    );

    expect(mockRouter.events.on).toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'Searching...' })).toBeInTheDocument();
    // Since router.events.on is mocked, the submit button text is stuck at "Searching..."
    
    await act(async () => {
      userEvent.clear(tagInput);
    });
  });

  test('error with tags (required)', async () => {
    const tagErrorChars = 'Letters and numbers only, max 100 characters. Try again';
    const tagErrorUnique = '3 unique tags at most!';
    const tagErrorRequired = 'This field is required';
    const { getByLabelText, getByRole, container } = render(<SearchForm {...data} />);

    const tagInput = getByLabelText('Tags:');
    const submitButton = getByRole('button', { name: 'Submit' });

    await act(async () => {
      userEvent.clear(tagInput);
      fireEvent.click(submitButton);
    });

    expect(container).toHaveTextContent(tagErrorRequired);
    expect(container).not.toHaveTextContent(tagErrorChars);
    expect(container).not.toHaveTextContent(tagErrorUnique);
  });

  test('error with tags (characters/length)', async () => {
    const tagErrorChars = 'Letters and numbers only, max 100 characters. Try again';
    const tagErrorUnique = '3 unique tags at most!';
    const tagErrorRequired = 'This field is required';
    const { getByLabelText, getByRole, container } = render(<SearchForm {...data} />);

    const tagInput = getByLabelText('Tags:');
    const submitButton = getByRole('button', { name: 'Submit' });

    await act(async () => {
      userEvent.clear(tagInput);
      await userEvent.type(tagInput, 'tag|');
      fireEvent.click(submitButton);
    });

    expect(container).not.toHaveTextContent(tagErrorRequired);
    expect(container).toHaveTextContent(tagErrorChars);
    expect(container).not.toHaveTextContent(tagErrorUnique);
  });

  test('error with tags (unique)', async () => {
    const tagErrorChars = 'Letters and numbers only, max 100 characters. Try again';
    const tagErrorUnique = '3 unique tags at most!';
    const tagErrorRequired = 'This field is required';
    const { getByLabelText, getByRole, container } = render(<SearchForm {...data} />);

    const tagInput = getByLabelText('Tags:');
    const submitButton = getByRole('button', { name: 'Submit' });

    await act(async () => {
      userEvent.clear(tagInput);
      await userEvent.type(tagInput, 'tag tag');
      fireEvent.click(submitButton);
    });

    expect(container).not.toHaveTextContent(tagErrorRequired);
    expect(container).not.toHaveTextContent(tagErrorChars);
    expect(container).toHaveTextContent(tagErrorUnique);
  });
});
