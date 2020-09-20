import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

import Layout, { siteTitle } from '@/components/Layout';
import withAuthComponent from '@/components/AuthComponents/withAuth';
import withAuthServerSideProps from '@/components/AuthComponents/withAuthGSSP';

/* The `Posts` component is used instead of `PostsContainer`
 * because its functionality is just unnecessary clutter for
 * the dashboard. For pagination, just go to the profile page.
 */
import Posts from '@/components/PostComponents/Posts';
import PostForm from '@/components/PostForm';

import { getDashboardPosts } from '@/lib/content';

const propTypes = {
  username: PropTypes.string,
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
};

const Dashboard = (props) => {
  const {
    username,
    posts
  } = props;

  const [ totalPosts, setTotalPosts ] = useState(posts);

  return (
    <Layout username={username}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <PostForm
          username={username}
          addToPosts={setTotalPosts}
          currentPosts={totalPosts}
        />

        <Posts posts={totalPosts} />
      </section>
    </Layout>
  );
};

Dashboard.propTypes = propTypes;

export default withAuthComponent(Dashboard, 'protectRoute');
export const getServerSideProps = withAuthServerSideProps(async (ctx, username) => {
  const posts = await getDashboardPosts(username, ctx);

  return {
    props:
      {
        username,
        posts
      }
  };
});
