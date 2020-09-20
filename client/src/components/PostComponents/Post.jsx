import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

import styles from '@/components/PostComponents/Post.module.css';

const propTypes = {
  username: PropTypes.string,
  name: PropTypes.string,
  post: PropTypes.string,
  date: PropTypes.string,
  tags: PropTypes.arrayOf(
    PropTypes.string
  ),
  url: PropTypes.string
};

const Post = (props) => {
  const {
    username,
    name,
    post,
    date,
    tags,
    url
  } = props;

  return (
    <>
      <p>{name}{' '}
        <Link href={'/profile/[user]'} as={`/profile/${username}`}>
          <a className={`${styles.links}`}>
            <strong>@{username}</strong>
          </a>
        </Link>
      </p>

      <p className={`${styles.wrap}`}>{post}</p>

      <Link href={'/profile/[user]/[post]'} as={`/profile/${username}/${url}`}>
        <a className={`${styles.links}`}>
          <strong>{date}</strong>
        </a>
      </Link>

      {tags &&
        <>
          <p>TAGS:{' '}
            {tags.map((tag, idx) => {
              if (idx === tags.length - 1) {
                return (
                  <React.Fragment key={tag}>
                    <Link href={`/explore?tags=${tag}`}>
                      <a className={`${styles.links} ${styles.wrap}`}>
                        <strong>{tag}</strong>
                      </a>
                    </Link>
                  </React.Fragment>
                );
              } else {
                return (
                  <React.Fragment key={tag}>
                    <Link href={`/explore?tags=${tag}`}>
                      <a className={`${styles.links} ${styles.wrap}`}>
                        <strong>{tag}</strong>
                      </a>
                    </Link>
                    <span>{', '}</span>
                  </React.Fragment>
                );
              }
            })}
          </p>
        </>
      }
    </>
  );
};

Post.propTypes = propTypes;

export default Post;
