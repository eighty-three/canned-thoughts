import React, { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Layout, { siteTitle } from '@/components/Layout';
import { lightAuthCheck } from '@/lib/authCheck';

import Profile from '@/components/Profile';
import PostsContainer from '@/components/PostComponents/PostsContainer';

import { getProfileInfo } from '@/lib/profile';
import { getPosts } from '@/lib/content';
import PaginationReducer from '@/lib/PaginationReducer';

const propTypes = {
  username: PropTypes.string,
  profileInfo: PropTypes.shape({
    username: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    followers: PropTypes.number,
    followStatus: PropTypes.bool,
    date: PropTypes.date
  }),
  profileUsername: PropTypes.string,
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
  page: PropTypes.number,
  error: PropTypes.string
};

const ProfilePage = (props) => {
  const {
    username, // Logged in user's username
    profileInfo,
    profileUsername, // Visited profile's username
    posts,
    page,
    error
  } = props;

  const initialState = {
    page: page,
    posts: posts,
    prevButtonDisabled: (page <= 1) ? true : false,
    nextButtonDisabled: (posts && posts.length > 10) ? false : true
  };

  const [ state, dispatch ] = useReducer(PaginationReducer, initialState);
  const router = useRouter();

  if (!error) {
    useEffect(() => {
      dispatch({ type: 'update', payload: { posts, page }});
    }, [posts, page]);
  }

  const changePage = async (actionType) => {
    const newPage = (actionType === 'next') ? state.page + 1 : state.page - 1;
    const newPosts = await getPosts(profileUsername, newPage);
    dispatch({ type: actionType, payload: newPosts });

    window.scrollTo(0, 0);
    router.push(
      `/profile/[user]/?page=${newPage}`, 
      `/profile/${profileUsername}/?page=${newPage}`
    );
  };

  const redirectLink = (profileUsername) ? `/profile/${profileUsername}` : null;

  return (
    <Layout 
      username={username} 
      redirect={redirectLink} 
    >
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        { error 
          ? (
            <h1 className={'text-center'}>{error}</h1>
          ) : (
            <>
              <Profile 
                {...profileInfo} 
                loggedInUsername={username} 
              />

              <PostsContainer 
                state={state}
                pageNav={changePage}
              />
            </>
          )
        }
      </section>
    </Layout>
  );
};

export const getServerSideProps = async (ctx) => {
  const username = await lightAuthCheck(ctx);
  const profileUsername = ctx.params.user;
  const profileInfo = await getProfileInfo(profileUsername, username);

  if (profileInfo.error) {
    return { 
      props: 
        { 
          username,
          error: profileInfo.error 
        } 
    };
  }

  const page = (Number(ctx.query.page) > 1) ? Number(ctx.query.page) : 1;
  const posts = await getPosts(profileUsername, page);
  
  return {
    props: 
      {
        username,
        profileInfo,
        profileUsername,
        posts,
        page
      }
  };
};

ProfilePage.propTypes = propTypes;

export default ProfilePage;
