import Head from 'next/head';
import React from 'react';

import utilStyles from '@/styles/utils.module.css';
import Layout, { siteTitle } from '@/components/Layout';
import withAuthComponent from '@/components/withAuth';
import withAuthServerSideProps from '@/components/withAuthGSSP';

import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { changePassword, changeUsername, deleteAccount } from '@/lib/settings';
import { getNameAndDescription } from '@/lib/profile';
import CustomAuthForms from '@/components/CustomAuthForms';
import ProfileInfoForm from '@/components/ProfileInfoForm';

function Settings({ username, profileInfo }) {
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
            />
          </Tab>


          <Tab eventKey="delete" title="Delete">
            <CustomAuthForms 
              forms={['password']} 
              title={'Delete Account'} 
              submitFunction={deleteAccount} 
              username={username}
            />
          </Tab>
        </Tabs>
      </section>
    </Layout>
  );
}

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
