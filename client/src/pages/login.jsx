import React from 'react';
import Head from 'next/head';

import Layout, { siteTitle } from '@/components/Layout';
import utilStyles from '@/styles/utils.module.css';
import withAuthComponent from '@/components/AuthComponents/withAuth';
import withAuthServerSideProps from '@/components/AuthComponents/withAuthGSSP';

import CustomAuthForms from '@/components/CustomAuthForms';

import { login } from '@/lib/account';

const LoginPage = () => {
  return (
    <Layout login>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <CustomAuthForms 
          forms={['username', 'password']} 
          title={'Log in'} 
          submitFunction={login}
          context={'login'}
        />
      </section>
    </Layout>
  );
};

export default withAuthComponent(LoginPage, 'loggedIn');
export const getServerSideProps = withAuthServerSideProps();
