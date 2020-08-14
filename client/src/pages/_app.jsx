import '@/styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import Router from 'next/router';

//NProgress
import NProgress from 'nprogress';
import '@/styles/nprogress.css';
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
