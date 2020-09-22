import React from 'react';
import PropTypes from 'prop-types';

import Pagination from 'react-bootstrap/Pagination';

import Posts from '@/components/PostComponents/Posts';

const propTypes = {
  state: PropTypes.shape({
    posts: PropTypes.arrayOf(
      PropTypes.shape({
        username: PropTypes.string,
        name: PropTypes.string,
        post: PropTypes.string,
        date: PropTypes.string,
        tags: PropTypes.arrayOf(
          PropTypes.string
        ),
        url: PropTypes.string
      })
    ),
    prevButtonDisabled: PropTypes.bool,
    nextButtonDisabled: PropTypes.bool
  }),
  pageNav: PropTypes.func
};

const PostsContainer = (props) => {
  const {
    state,
    pageNav
  } = props;

  return (
    <>
      <Posts posts={state.posts} />
      <Pagination size='lg'>
        <Pagination.Prev 
          onClick={() => pageNav('prev')}
          disabled={state.prevButtonDisabled}
        />
        <Pagination.Next 
          onClick={() => pageNav('next')}
          disabled={state.nextButtonDisabled}
        />
      </Pagination>
    </>
  );
};

PostsContainer.propTypes = propTypes;

export default PostsContainer;
