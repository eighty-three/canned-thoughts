import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

import utilStyles from '@/styles/utils.module.css';
import styles from '@/components/Layout/Navbar.module.css';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { logout } from '@/lib/account';

const LoggedInPropTypes = {
  username: PropTypes.string
};

const LoggedIn = (props) => {
  const {
    username
  } = props;

  return (
    <>
      {/* Override for burger button */}
      <style type="text/css">
        {`
          button.navbar-toggler {
            padding: 3px 9px;
          }
        `}
      </style>

      <Navbar expand="sm">
        <Navbar.Text>
          Logged in as{' '}
          <Link href={'/profile/[user]'} as={`/profile/${username}`}>
            <a className={utilStyles.anchorNormal}>
              <strong>{username}</strong>
            </a>
          </Link>
        </Navbar.Text>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav>
            <Link href="/dashboard" passHref>
              <Nav.Link>Home</Nav.Link>
            </Link>
            <Link href="/explore" passHref>
              <Nav.Link>Explore</Nav.Link>
            </Link>
            <Link href="/settings" passHref>
              <Nav.Link>Settings</Nav.Link>
            </Link>
            <Nav.Link onClick={logout}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
};

LoggedIn.propTypes = LoggedInPropTypes;

const NotLoggedInPropTypes = {
  redirect: PropTypes.string
};

const NotLoggedIn = ({ redirect }) => {
  const redirectLink = (redirect)
    ? `/login?redirect=${redirect}`
    : '/login';

  return (
    <Navbar className="justify-content-end">
      <Nav>
        <Link href={redirectLink} passHref>
          <Nav.Link>Login</Nav.Link>
        </Link>

        <Link href="/signup" passHref>
          <Nav.Link>Signup</Nav.Link>
        </Link>
      </Nav>
    </Navbar>
  );
};

NotLoggedIn.propTypes = NotLoggedInPropTypes;

const NavbarComponentPropTypes = {
  username: PropTypes.string,
  redirect: PropTypes.string
};

const NavbarComponent = (props) => {
  const {
    username,
    redirect
  } = props;

  return (
    <>
      {username 
        ? <LoggedIn username={username} /> 
        : <NotLoggedIn redirect={redirect} />
      }
      <div className={`${styles.bar}`}></div>
    </>
  );
};

NavbarComponent.propTypes = NavbarComponentPropTypes;

export default NavbarComponent;
