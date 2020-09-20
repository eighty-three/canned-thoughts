import Head from 'next/head';
import React from 'react';
import PropTypes from 'prop-types';

import Layout, { siteTitle } from '@/components/Layout';
import { lightAuthCheck } from '@/lib/authCheck';

import Post from '@/components/PostComponents/Post';

import { getPost } from '@/lib/content';

const propTypes = {
  username: PropTypes.string,
  postInfo: PropTypes.shape({
    username: PropTypes.string,
    name: PropTypes.string,
    post: PropTypes.string,
    date: PropTypes.string,
    tags: PropTypes.arrayOf(
      PropTypes.string
    ),
    url: PropTypes.string
  }),
  error: PropTypes.string
};


const PostPage = (props) => {
  const {
    username, // Logged in user's username
    postInfo,
    error
  } = props;

  const redirectLink = (postInfo)
    ? `/profile/${postInfo.username}/${postInfo.url}`
    : null;

  return (
    <Layout username={username} redirect={redirectLink}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        { !error 
          ? (
            <Post
              {...postInfo} 
            />
          ) : (
            <h1 className={'text-center'}>{error}</h1>
          )
        }
      </section>
    </Layout>
  );
};

export async function getServerSideProps(ctx) {
  const username = await lightAuthCheck(ctx);
  const postUrl = ctx.params.post;
  const profileName = ctx.params.user;
  const postInfo = await getPost(profileName, postUrl);

  if (postInfo.error) {
    return { 
      props: 
        { 
          username,
          error: postInfo.error
        } 
    };
  }
  
  return {
    props: 
      {
        username,
        postInfo
      }
  };
}

PostPage.propTypes = propTypes;

export default PostPage;
