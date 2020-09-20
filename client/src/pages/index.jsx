import Head from 'next/head';
import React, { useState } from 'react';

import Layout, { siteTitle } from '@/components/Layout';
import utilStyles from '@/styles/utils.module.css';
import withAuthComponent from '@/components/AuthComponents/withAuth';
import withAuthServerSideProps from '@/components/AuthComponents/withAuthGSSP';

import CustomAuthForms from '@/components/CustomAuthForms';

import { login, signup } from '@/lib/account';

const LandingPage = () => {
  const loginArgs = {
    form: {
      submitFunction: login,
      title: 'Log in',
      context: 'login'
    },
    helpText: 'Don\'t have an account yet?'
  };

  const signupArgs = {
    form: {
      submitFunction: signup,
      title: 'Sign up',
      context: 'signup'
    },
    helpText: 'Already have an account?'
  };

  const [ formArgs, setFormArgs ] = useState(loginArgs);

  const toggleForm = () => {
    (formArgs.form.context === 'login')
      ? setFormArgs({...signupArgs})
      : setFormArgs({...loginArgs});
  };

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <h1 className={utilStyles.withSubText}><strong>Canned Thoughts</strong></h1>
        <i>
          <a className={`${utilStyles.anchorNormal} ${utilStyles.subText}`} 
            href="https://www.merriam-webster.com/dictionary/canned">
            adj: lacking originality or individuality as if mass-produced
        	</a>
        </i>

        <CustomAuthForms {...formArgs.form} forms={['username', 'password']} />

        <div className="text-center">
          <a className={`${utilStyles.anchorColor}`} onClick={toggleForm} href='#'>{formArgs.helpText}</a>
        </div>
      </section>
    </Layout>
  );
};

export default withAuthComponent(LandingPage, 'loggedIn');
export const getServerSideProps = withAuthServerSideProps();
