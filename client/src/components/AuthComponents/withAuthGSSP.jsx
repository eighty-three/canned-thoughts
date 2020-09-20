import PropTypes from 'prop-types';

import authCheck from '@/lib/authCheck';

const propTypes = {
  getServerSidePropsFunc: PropTypes.func
};

const withAuthServerSideProps = (getServerSidePropsFunc) => {
  return async (ctx) => {
    const username = await authCheck(ctx);
    if (getServerSidePropsFunc) {
      return {
        props: 
          {
            username,
            data: await getServerSidePropsFunc(ctx, username)
          }
      };
    }

    return {
      props: 
        {
          username,
          data: 
            {
              props: 
                {
                  username
                }
            }
        }
    };
  };
};

withAuthServerSideProps.propTypes = propTypes;

export default withAuthServerSideProps;