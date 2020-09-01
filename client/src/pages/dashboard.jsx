import Head from 'next/head';
import React from 'react';
import { useForm } from 'react-hook-form';

import Layout, { siteTitle } from '@/components/Layout';
import utilStyles from '@/styles/utils.module.css';
import withAuthComponent from '@/components/withAuth';
import withAuthServerSideProps from '@/components/withAuthGSSP';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { writeThought } from '@/lib/content';
import Thought from '@/components/Thought';

const thought = 'Some quick example text to build on the card';
const date = 'sample_date';
const tags = 'tag1, tag2, tag3';

function Dashboard({ username }) {
  const { register, handleSubmit, errors } = useForm();
  return (
    <Layout username={username}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <p className={utilStyles.headingMd}>Write your canned thought</p>
        <Form onSubmit={handleSubmit(writeThought)}>
          <Form.Control 
            spellCheck="false"
            as="textarea" 
            rows="3"
            type="text"
            maxLength={250}
            placeholder="Add up to three tags at the end #of #your #post"
            aria-invalid={errors.content ? 'true' : 'false'}
            aria-describedby="thoughtError" 
            name="thought"
            ref={register({ required: true })} 
          />

          <Button variant="dark" type="submit" block>
            Submit
          </Button>
        </Form>
      </section>
      <section>
        <Thought username={username} thought={thought} date={date} tags={tags}/>
      </section>
    </Layout>
  );
}

export default withAuthComponent(Dashboard, 'protectRoute');
export const getServerSideProps = withAuthServerSideProps();
