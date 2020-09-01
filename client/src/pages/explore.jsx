import Head from 'next/head';
import React from 'react';

import Layout, { siteTitle } from '@/components/Layout';
import utilStyles from '@/styles/utils.module.css';
import withAuthComponent from '@/components/withAuth';
import withAuthServerSideProps from '@/components/withAuthGSSP';

const Explore = ({ username }) => {
  return (
    <Layout username={username}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Explore! {username}</p>
      </section>
    </Layout>
  );
};

export default withAuthComponent(Explore, 'protectRoute');
export const getServerSideProps = withAuthServerSideProps();
