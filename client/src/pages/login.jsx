import Head from 'next/head';
import React from 'react';

import Layout, { siteTitle } from '@/components/layout';
import utilStyles from '@/styles/utils.module.css';
import withAuthComponent from '@/components/withAuth';
import withAuthServerSideProps from '@/components/withAuthGSSP';

import { login } from '@/lib/account';
import CustomAuthForms from '@/components/CustomAuthForms';

function LoginPage() {
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
          login
        />
      </section>
    </Layout>
  );
}

export default withAuthComponent(LoginPage, 'loggedIn');
export const getServerSideProps = withAuthServerSideProps();
