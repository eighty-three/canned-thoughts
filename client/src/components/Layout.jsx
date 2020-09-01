import Head from 'next/head';
import React from 'react';
import PropTypes from 'prop-types';

import styles from '@/components/Layout.module.css';
import NavbarComponent from '@/components/Navbar';

export const siteTitle = 'Canned Thoughts';

const propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]),
  username: PropTypes.string,
  home: PropTypes.bool,
  login: PropTypes.bool,
  redirect: PropTypes.string
};

const Layout = (props) => {
  const {
    children,
    username,
    home,
    login,
    redirect
  } = props;

  return (
    <div className={styles.container}>
      {/* Meta Tags */}
      <Head>
        <link rel='icon' href='/favicon.ico' />
        <meta
          name='description'
          content={siteTitle}
        />
      </Head>
      
      {/* Contents */}
      <main>
        { !home && !login
          && <NavbarComponent username={username} redirect={redirect} />
        }
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = propTypes;

export default Layout;
