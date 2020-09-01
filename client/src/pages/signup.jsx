import Head from 'next/head';
import React from 'react';

import Layout, { siteTitle } from '@/components/layout';
import utilStyles from '@/styles/utils.module.css';
import withAuthComponent from '@/components/withAuth';
import withAuthServerSideProps from '@/components/withAuthGSSP';

import { signup } from '@/lib/account';
import CustomAuthForms from '@/components/CustomAuthForms';

function SignupPage() {
  return (
    <Layout login>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <CustomAuthForms 
          forms={['username', 'password']} 
          title={'Sign up'} 
          submitFunction={signup} 
        />
      </section>
    </Layout>
  );
}

export default withAuthComponent(SignupPage, 'loggedIn');
export const getServerSideProps = withAuthServerSideProps();
