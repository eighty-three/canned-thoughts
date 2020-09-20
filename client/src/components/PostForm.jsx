import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import utilStyles from '@/styles/utils.module.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { createPost, checkIfValidTags } from '@/lib/content';

const propTypes = {
  username: PropTypes.string,
  addToPosts: PropTypes.func,
  currentPosts: PropTypes.arrayOf(
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
  )
};

const PostForm = (props) => {
  const {
    username,
    addToPosts,
    currentPosts
  } = props;
  
  const [ buttonState, setButtonState ] = useState({ disabled: false, text: 'Submit' });
  const [ ifValidTags, setValidity ] = useState(true);
  const { register, handleSubmit, errors } = useForm();

  const handleChange = ({ target }) => setValidity(checkIfValidTags(target.value));

  const onSubmit = async (data) => {
    setButtonState({ disabled: true, text: 'Sending...' });
    const newPost = await createPost(username, data);

    if (!newPost.error) {
      setButtonState({ disabled: false, text: 'Submit' });
      addToPosts([ newPost, ...currentPosts ]);
    } else {
      setButtonState({ disabled: false, text: newPost.error });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group controlId="post">
        <Form.Label column>Write your canned thought:
          {errors.post && 
            <p className={`${utilStyles.formError}`}>{errors.post.message}</p>
          }
        </Form.Label>
        <Form.Control 
          spellCheck="false"
          as="textarea" 
          rows="3"
          type="text"
          aria-invalid={errors.post ? 'true' : 'false'}
          aria-describedby="post" 
          name="post"
          ref={register({ 
            required: true, 
            pattern: {
              value: /^[\\/\[\]\(\) \n a-zA-Z0-9 _'":;~%^&*$!@?#,.-]{1,249}$/,
              message: 'Invalid characters or length (max 250). Try again'
            }
          })} 
        />
      </Form.Group>

      <Form.Group controlId="tags">
        <Form.Label column>Tags (optional):
          {errors.tags && ifValidTags &&
            <p className={`${utilStyles.formError}`}>{errors.tags.message}</p>
          }
          {!ifValidTags &&
            <p className={`${utilStyles.formError}`}>3 unique tags at most!</p>
          }
        </Form.Label>
        <Form.Control 
          spellCheck="false"
          as="textarea" 
          rows="3"
          type="text"
          placeholder="'tag1 tag2 tag3' -> [ 'tag1', 'tag2', 'tag3' ]"
          onChange={handleChange}
          aria-invalid={errors.tags || !ifValidTags ? 'true' : 'false'}
          aria-describedby="tags"
          name="tags"
          ref={register({ 
            required: false,
            pattern: {
              value: /^[a-zA-Z0-9 ]{1,99}$/,
              message: 'Letters and numbers only, max 100 characters. Try again'
            },
            validate: checkIfValidTags
          })} 
        />
      </Form.Group>

      <Button variant="dark" type="submit" block disabled={buttonState.disabled}>
        {buttonState.text}
      </Button>
    </Form>
  );
};


PostForm.propTypes = propTypes;

export default PostForm;
