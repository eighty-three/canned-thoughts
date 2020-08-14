import Head from 'next/head';
import React from 'react';

import styles from '@/components/layout.module.css';
import NavbarComponent from '@/components/Navbar';

export const siteTitle = 'Canned Thoughts';

export default function Layout({ children, username, home, login, redirect }) {
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
}

