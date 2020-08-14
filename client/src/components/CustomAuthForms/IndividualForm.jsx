import React from 'react';

import Form from 'react-bootstrap/Form';

export default function IndividualForm({ id, label, username, title, register }) {
  return (
    <Form.Group controlId={`${title} ${id}`}>
      <Form.Label>{label}:</Form.Label>
      {username
        ? (
          <Form.Control 
            type="text"
            maxLength={30}
            pattern="[a-z0-9_]{1,29}"
            placeholder="[ a-z0-9_ ]{1,29}"
            spellCheck="false"
            aria-describedby={id}
            name={id}
            ref={register({ required: true })} 
          />
        ) : (
          <Form.Control 
            type="password"
            maxLength={200}
            placeholder="maxLength=200"
            aria-describedby={id}
            name={id}
            ref={register({ required: true })} 
          />
        )
      }
    </Form.Group>
  );
}

