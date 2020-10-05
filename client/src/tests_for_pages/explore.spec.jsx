/* eslint no-import-assign: 0 */  // --> OFF

import '@testing-library/jest-dom/extend-expect';
import 'jsdom-global/register';

import 'mutationobserver-shim';
global.MutationObserver = window.MutationObserver;

import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Explore, { getServerSideProps } from '@/pages/explore';

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
  //username: PropTypes.string,
  //tags: PropTypes.string,
  //userScope: PropTypes.oneOf(['all', 'followed', 'self']),
  //tagScope: PropTypes.oneOf(['inclusive', 'exclusive']),
  //page: PropTypes.number,
  //posts: PropTypes.arrayOf(
    //PropTypes.shape({
      //username: PropTypes.string,
      //name: PropTypes.string,
      //post: PropTypes.string,
      //date: PropTypes.string,
      //tags: PropTypes.arrayOf(
        //PropTypes.string
      //),
      //url: PropTypes.string
    //})
  //),


//describe('renders', () => {
  //const username = 'test_username';
  //const posts = createPosts(10);

  //const data = { 
    //username,
    //data: { props: { username, posts } }
  //};

  //test('works', async () => {
    //const response = await Explore(data);
    //render(response);

    //expect(screen.getByLabelText('Write your canned thought:')).toBeInTheDocument();
    //expect(screen.getByLabelText('Tags (optional):')).toBeInTheDocument();

    //expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

    //expect(screen.getByRole('link', { name: 'test_date1' })).toBeInTheDocument();
    //expect(screen.getByRole('link', { name: 'test_date10' })).toBeInTheDocument();
  //});
//});

describe('getServerSideProps', () => {
  const username = 'test_username';
  auth.authCheck = jest.fn().mockReturnValue(username);
  content.searchPosts = jest.fn();

  describe('tags', () => {
    test('null', async () => {
      const ctx = {
        query: {
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual( // Because it's withAuthGSSP
        expect.objectContaining({
          tags: null
        })
      );
    });

    test('invalid', async () => {
      const ctx = {
        query: {
          tags: 'tag1,tag2,tag3,tag4'
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          tags: null
        })
      );
    });

    test('correct', async () => {
      const ctx = {
        query: {
          tags: 'tag1,tag2,tag3'
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          tags: 'tag1 tag2 tag3'
        })
      );
    });
  });

  describe('scopes', () => {
    test('all null', async () => {
      const ctx = { query: {} };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          userScope: 'all',
          tagScope: 'inclusive'
        })
      );
    });

    test('invalid', async () => {
      const ctx = {
        query: {
          userScope: 'not_a_choice',
          tagScope: 'invalid'
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          userScope: 'all',
          tagScope: 'inclusive'
        })
      );
    });

    test('userscope followed', async () => {
      const ctx = {
        query: {
          userScope: 'followed',
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          userScope: 'followed',
        })
      );
    });

    test('userscope self', async () => {
      const ctx = {
        query: {
          userScope: 'self'
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          userScope: 'self',
        })
      );
    });

    test('userscope all', async () => {
      const ctx = {
        query: {
          userScope: 'all',
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          userScope: 'all',
        })
      );
    });

    test('tagscope exclusive', async () => {
      const ctx = {
        query: {
          tagScope: 'exclusive',
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          tagScope: 'exclusive',
        })
      );
    });

    test('tagscope inclusive', async () => {
      const ctx = {
        query: {
          tagScope: 'inclusive',
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          tagScope: 'inclusive',
        })
      );
    });
  });

  describe('page', () => {
    test('null', async () => {
      const ctx = {
        query: {
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          page: 1
        })
      );
    });

    test('page = 0', async () => {
      const ctx = {
        query: {
          page: 0
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          page: 1
        })
      );
    });

    test('page = 1', async () => {
      const ctx = {
        query: {
          page: 1
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          page: 1
        })
      );
    });

    test('page > 1', async () => {
      const ctx = {
        query: {
          page: 3
        }
      };
      
      const response = await getServerSideProps(ctx);

      expect(response.props.data.props).toEqual(
        expect.objectContaining({
          page: 3
        })
      );
    });
  });

  describe('posts', () => {
    const mockFn = jest.fn().mockResolvedValueOnce({ message: 'success' });
    content.searchPosts = mockFn;

    beforeEach(() => {
      mockFn.mockReset();
    });

    test('no tags/username', async () => {
      const ctx = {
        query: {
          tags: null
        }
      };
      
      await getServerSideProps(ctx);

      expect(mockFn).not.toHaveBeenCalled();
    });

    test('works', async () => {
      const ctx = {
        query: {
          tags: 'tag1,tag2'
        }
      };
      
      await getServerSideProps(ctx);

      expect(mockFn).toHaveBeenCalled();
    });
  });
});
