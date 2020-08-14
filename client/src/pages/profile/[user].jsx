import Head from 'next/head';
import React from 'react';

import Layout, { siteTitle } from '@/components/layout';
import { lightAuthCheck } from '@/lib/authCheck';

import Profile from '@/components/Profile';
import { getNameAndDescription } from '@/lib/profile';
import { checkIfFollowed, getFollowersCount } from '@/lib/follows';

export default function ProfilePage({ username, profileInfo, profileUsername, followersCount, followStatus, error }) {
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
          ? ( /* Fix this, doesn't work properly */
            <Profile username={profileUsername} 
              {...profileInfo} 
              followers={followersCount} 
              loggedIn={username} 
              followStatus={followStatus} 
            />
          ) : (
            <h1 className={'text-center'}>PROFILE NOT FOUND</h1>
          )
        }
      </section>
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const username = await lightAuthCheck(ctx);
  const profileUsername = ctx.params.user;
  const profileInfo = await getNameAndDescription(profileUsername);

  if (profileInfo.error) {
    return { 
      props: 
        { 
          username,
          error: profileInfo.error 
        } 
    };
  }

  const followStatus =  (username !== profileUsername) 
    ? await checkIfFollowed(username, profileUsername)
    : false;

  const followersCount = await getFollowersCount(profileUsername);
  
  return {
    props: 
      {
        username,
        profileInfo,
        profileUsername,
        followersCount,
        followStatus
      }
  };
}
