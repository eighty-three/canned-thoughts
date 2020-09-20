import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';

import utilStyles from '@/styles/utils.module.css';
import Layout, { siteTitle } from '@/components/Layout';
import withAuthComponent from '@/components/AuthComponents/withAuth';
import withAuthServerSideProps from '@/components/AuthComponents/withAuthGSSP';

import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

import CustomAuthForms from '@/components/CustomAuthForms';
import ProfileInfoForm from '@/components/ProfileInfoForm';

import { changePassword, changeUsername, deleteAccount } from '@/lib/settings';
import { getNameAndDescription } from '@/lib/profile';

const propTypes = {
  username: PropTypes.string,
  profileInfo: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    username: PropTypes.string
  })
};

const Settings = (props) => {
  const {
    username,
    profileInfo
  } = props;

  return (
    <Layout username={username}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        {/* Override Bootstrap styling */}
        <style type="text/css">
          {`
            .nav-link, .nav-link:hover {
              color: rgb(130, 25, 25);
              outline-color: rgba(130, 25, 25, 0.5);
            }
          `}
        </style>

        <Tabs className={'nav-fill'} defaultActiveKey="profile" transition={false} id="uncontrolled-tabs">
          <Tab eventKey="profile" title="Profile">
            <ProfileInfoForm {...profileInfo} username={username} />
          </Tab>

          <Tab eventKey="account" title="Account">
            <CustomAuthForms 
              forms={['newUsername', 'password']} 
              title={'Change Username'} 
              submitFunction={changeUsername} 
              username={username}
              context={'settings'}
            />

            <div className={`w-75 mx-auto text-center ${utilStyles.subText}`}>
              Logs out on success
            </div>

            <hr />
            <CustomAuthForms 
              forms={['password', 'newPassword']} 
              title={'Change Password'} 
              submitFunction={changePassword} 
              username={username}
              context={'settings'}
            />
          </Tab>

          <Tab eventKey="delete" title="Delete">
            <CustomAuthForms 
              forms={['password']} 
              title={'Delete Account'} 
              submitFunction={deleteAccount} 
              username={username}
              context={'settings'}
            />
          </Tab>
        </Tabs>
      </section>
    </Layout>
  );
};

Settings.propTypes = propTypes;

export default withAuthComponent(Settings, 'protectRoute');
export const getServerSideProps = withAuthServerSideProps(async (ctx, username) => {
  const profileInfo = await getNameAndDescription(username);

  return {
    props: 
      {
        username,
        profileInfo
      }
  };
});
