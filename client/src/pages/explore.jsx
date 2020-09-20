import React, { useState, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';

import Layout, { siteTitle } from '@/components/Layout';
import utilStyles from '@/styles/utils.module.css';
import withAuthComponent from '@/components/AuthComponents/withAuth';
import withAuthServerSideProps from '@/components/AuthComponents/withAuthGSSP';

import PostsContainer from '@/components/PostComponents/PostsContainer';
import SearchForm from '@/components/SearchForm';

import { searchPosts } from '@/lib/content';
import PaginationReducer from '@/lib/PaginationReducer';

const propTypes = {
  username: PropTypes.string,
  tags: PropTypes.string,
  userScope: PropTypes.oneOf(['all', 'followed', 'self']),
  tagScope: PropTypes.oneOf(['inclusive', 'exclusive']),
  page: PropTypes.number,
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string,
      name: PropTypes.string,
      post: PropTypes.string,
      date: PropTypes.string,
      tags: PropTypes.arrayOf(
        PropTypes.string
      ),
      url: PropTypes.string
    })
  ),
};

const Explore = (props) => {
  const {
    username,
    tags,
    userScope,
    tagScope,
    page,
    posts
  } = props;

  const initialPaginationState = {
    page: page,
    posts: posts,
    prevButtonDisabled: (page <= 1) ? true : false,
    nextButtonDisabled: (posts && posts.length > 10) ? false : true
  };

  const [ state, dispatch ] = useReducer(PaginationReducer, initialPaginationState);

  const [ formState, setFormState ] = useState({ tags, userScope, tagScope });
  const router = useRouter();

  useEffect(() => {
    const postsPayload = (posts && posts.length) ? posts: [];
    dispatch({ type: 'update', payload: { posts: postsPayload, page }});
  }, [tags, userScope, tagScope, page]);

  const changePage = async (actionType) => {
    const newPage = (actionType === 'next') ? state.page + 1 : state.page - 1;
    const newPosts = await searchPosts(username, {...formState}, newPage);
    dispatch({ type: actionType, payload: newPosts });

    const queryTags = formState.tags.trim().split(' ').join(',');

    window.scrollTo(0, 0);
    router.push(
      `/explore?tags=${queryTags}&userScope=${formState.userScope}&tagScope=${formState.tagScope}&page=${newPage}`,
    );
  };

  return (
    <Layout username={username}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <SearchForm
          tags={tags}
          setFormState={setFormState}
        />

        {posts &&
          <PostsContainer
            state={state}
            pageNav={changePage}
          />
        }
      </section>
    </Layout>
  );
};

Explore.propTypes = propTypes;

export default withAuthComponent(Explore, 'protectRoute');
export const getServerSideProps = withAuthServerSideProps(async (ctx, username) => {
  let tags = null;
  if (typeof ctx.query.tags === 'string') {
    const tempArr = ctx.query.tags.trim().split(',');
    tags = (tempArr.length <= 3) ? tempArr.join(' ') : null;
  }

  const userScope = (ctx.query.userScope === ('followed' || 'all' || 'self')) ? ctx.query.userScope : 'all';
  const tagScope = (ctx.query.tagScope === 'exclusive') ? 'exclusive' : 'inclusive';

  const page = (Number(ctx.query.page) > 1) ? Number(ctx.query.page) : 1;

  // If there are no tags, don't prepopulate the posts.
  // Likewise, if the user has no authentication, don't call the search function
  const posts = (tags && username)
    ? await searchPosts(username, { tags, userScope, tagScope }, page, ctx)
    : null;

  return {
    props:
      {
        username,
        tags,
        userScope,
        tagScope,
        page,
        posts
      }
  };
});
