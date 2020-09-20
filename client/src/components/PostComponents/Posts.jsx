import React from 'react';
import PropTypes from 'prop-types';

import Post from '@/components/PostComponents/Post';

const propTypes = {
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
  )
};

const Posts = (props) => {
  const {
    posts
  } = props;

  return (
    <>
      {(posts.length > 0)
        ? (
          <>
            {posts.map((post, idx) => {
              if (idx < 10) {
                /* Display only 10 posts at a time.
                 *
                 * The getPosts function normally receives
                 * 11 posts but only 10 gets displayed so that
                 * the page navigation buttons would know if
                 * there is a next page or not. This filter also
                 * serves as a way to avoid any unnecessary 
                 * rerenders when creating a post in the dashboard.
                 * Instead of manipulating the state to remove the
                 * last element, just hide it like so since it'll 
                 * vanish upon page refresh anyway
                 */
                return (
                  <React.Fragment key={post.url}>
                    <hr />
                    <Post
                      username={post.username}
                      name={post.name}
                      post={post.post}
                      date={post.date}
                      tags={post.tags}
                      url={post.url}
                    />
                  </React.Fragment>
                );
              }
            })}
          </>
        ) : (
          <h1 className={'text-center'}>No posts here.</h1>
        )
      }
    </>
  );
};

Posts.propTypes = propTypes;

export default Posts;
