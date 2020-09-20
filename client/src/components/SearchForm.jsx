import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import utilStyles from '@/styles/utils.module.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { checkIfValidTags } from '@/lib/content';

const propTypes = {
  tags: PropTypes.string,
  searchPostsFn: PropTypes.func
};

const SearchForm = (props) => {
  const {
    tags,
    searchPostsFn
  } = props;

  const [ ifValidTags, setValidity ] = useState(true);
  const { register, handleSubmit, errors } = useForm();

  const handleChange = ({ target }) => setValidity(checkIfValidTags(target.value));

  return (
    <Form onSubmit={handleSubmit(searchPostsFn)}>
      <Form.Check type="radio" inline defaultChecked readOnly ref={register({ required: true })} 
        id="user-all"
        name="userScope" 
        value="all" 
        label="All" 
      />

      <Form.Check type="radio" inline readOnly ref={register({ required: true })} 
        id="user-followed-only"
        name="userScope" 
        value="followed" 
        label="Followed Only" 
      />

      <Form.Check type="radio" inline readOnly ref={register({ required: true })} 
        id="user-self"
        name="userScope" 
        value="self" 
        label="Self" 
      />

      <br />

      <Form.Check type="radio" inline defaultChecked readOnly ref={register({ required: true })} 
        id="tags-inclusive"
        name="tagScope" 
        value="inclusive" 
        label="Inclusive" 
      />

      <Form.Check type="radio" inline readOnly ref={register({ required: true })} 
        id="tags-exclusive"
        name="tagScope" 
        value="exclusive" 
        label="Exclusive" 
      />

      <Form.Group controlId="tags">
        <Form.Label column>Tags:
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
          defaultValue={tags}
          name="tags"
          ref={register({ 
            required: true, 
            pattern: {
              value: /^[a-zA-Z0-9 ]{1,99}$/,
              message: 'Letters and numbers only, max 100 characters. Try again'
            },
            validate: checkIfValidTags
          })} 
        />
      </Form.Group>

      <Button variant="dark" type="submit" block>
            Submit
      </Button>
    </Form>
  );
};

SearchForm.propTypes = propTypes;

export default SearchForm;
