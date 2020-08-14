import React, { useEffect } from 'react';
import Router, { useRouter } from 'next/router';

function RedirectComponent({ loggedIn, protectRoute }) {
  useEffect(() => {
    Router.replace(newPath);
  }, []);

  const prevPath = useRouter().pathname;
  let newPath, loadingText;

  if (loggedIn) {
    newPath = '/dashboard';
    loadingText = 'Already logged in';
  } else if (protectRoute) {
    newPath = `/login?redirect=${prevPath}`;
    loadingText ='Not authenticated';
  }

  return (
    <h1 className="text-center">{loadingText}</h1>
  );
}

export default function withAuthComponent(Component, redirectAction) {
  const Authenticated = ({ username, data }) => {
    if (redirectAction === 'loggedIn' && username) {
      return <RedirectComponent loggedIn/>;
    } else if (!username) {
      if (redirectAction === 'protectRoute') {
        return <RedirectComponent protectRoute/>;
      }
    }

    return <Component {...data.props}/>;
  };

  return Authenticated;
}
