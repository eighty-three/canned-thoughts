import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Card from 'react-bootstrap/Card';
import { toggleFollowStatus } from '@/lib/follows';

const propTypes = {
  username: PropTypes.string,
  name: PropTypes.string,
  description: PropTypes.string,
  followers: PropTypes.number,
  loggedInUsername: PropTypes.string,
  followStatus: PropTypes.bool
};

const Profile = (props) => {
  const {
    username, // Visited profile's username
    name,
    description,
    followers,
    loggedInUsername, // Logged in user's username
    followStatus
  } = props;

  const [ followStatusState, setFollowStatusState ] = useState({ followStatus, followers });

  useEffect(() => {
    setFollowStatusState({ followStatus, followers });
  }, [followStatus, followers]);

  const handleButtonClick = async (loggedInUsername, profileUsername) => {
    const check = await toggleFollowStatus(loggedInUsername, profileUsername); // Change the follow status in the database

    if (!check.error) {
      const newFollowStatus = (followStatusState.followStatus)
        ? { followStatus: !followStatusState.followStatus, followers: followStatusState.followers - 1 }
        : { followStatus: !followStatusState.followStatus, followers: followStatusState.followers + 1 };

      setFollowStatusState(newFollowStatus);
      /* Set followStatus to the opposite of its current state instead of having to make a request to the database
       * Similarly, for the followers count, just add or deduct instead of having to make a request to the database
       */
    }
  };

  
  return (
    <Card style={{ width: '100%' }}>
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Subtitle>{username}</Card.Subtitle>
        <Card.Text>{description}</Card.Text>
        <hr />
        <span>Followers: {followStatusState.followers}</span> 
        {(loggedInUsername && loggedInUsername !== username) &&
          <button onClick={() => handleButtonClick(loggedInUsername, username)}>
            {followStatusState.followStatus
              ? 'Unfollow'
              : 'Follow'
            }
          </button>
        }
      </Card.Body>
    </Card>
  );
};

Profile.propTypes = propTypes;

export default Profile;
