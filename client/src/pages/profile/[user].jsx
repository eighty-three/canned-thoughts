import Head from 'next/head';
import React from 'react';
import PropTypes from 'prop-types';

import Layout, { siteTitle } from '@/components/layout';
import { lightAuthCheck } from '@/lib/authCheck';

import Profile from '@/components/Profile';
import { getProfileInfo } from '@/lib/profile';
import { checkIfFollowed } from '@/lib/follows';

const propTypes = {
  username: PropTypes.string,
  profileInfo: PropTypes.shape({
    username: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    followers: PropTypes.number
  }),
  profileUsername: PropTypes.string,
  followStatus: PropTypes.bool,
  error: PropTypes.string
};

export default function ProfilePage(props) {
  const {
    username, // Logged in user's username
    profileInfo,
    profileUsername, // Visited profile's username
    followStatus,
    error
  } = props;

  console.log(profileInfo);

  const redirectLink = (profileUsername)
    ? `/profile/${profileUsername}`
    : null;

  return (
    <Layout username={username} redirect={redirectLink}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        { !error 
          ? (
            <Profile username={profileUsername} 
              {...profileInfo} 
              loggedInUsername={username} 
              followStatus={followStatus} 
            />
          ) : (
            <h1 className={'text-center'}>{error}</h1>
          )
        }
      </section>
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const username = await lightAuthCheck(ctx);
  const profileUsername = ctx.params.user;
  const profileInfo = await getProfileInfo(profileUsername);

  if (profileInfo.error) {
    return { 
      props: 
        { 
          username,
          error: profileInfo.error 
        } 
    };
  }

  const followStatus = (username !== profileUsername) 
    ? await checkIfFollowed(username, profileUsername)
    : false;
  
  return {
    props: 
      {
        username,
        profileInfo,
        profileUsername,
        followStatus
      }
  };
}

ProfilePage.propTypes = propTypes;
