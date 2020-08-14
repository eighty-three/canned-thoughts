import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import utilStyles from '@/styles/utils.module.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { updateProfileInfo } from '@/lib/profile';

export default function ProfileInfoForm({ name, description, username }) {
  const [submitStatus, setSubmitStatus] = useState('Update Profile Info');
  const { register, handleSubmit } = useForm();

  const revertStatus = () => setSubmitStatus('Update Profile Info');
  const submitShowError = async (data) => {
    const req = await updateProfileInfo(data, username);
    if (req) setSubmitStatus(req);
  };

  return (
    <>
      {/* Override form:focus color */}
      <style type="text/css">
        {`
        .form-control:focus {
          border-color: rgba(130, 25, 25, 0.3);
          box-shadow: 0 0 0 0.2rem rgba(130, 25, 25, 0.15);
        }
      `}
      </style>

      <div className={`w-75 mx-auto ${utilStyles.pd20}`}>
        <Form className="mx-auto" onSubmit={handleSubmit(submitShowError)}>
          <Form.Group controlId='formProfileName'>
            <Form.Label>Name:</Form.Label>
            <Form.Control 
              type="text"
              maxLength={50}
              pattern="[a-zA-Z0-9 _$!@?-]{1,49}"
              placeholder="[ a-zA-Z0-9_$!@?- ]{1,49}"
              spellCheck="false"
              aria-describedby="profileName"
              name="newName"
              defaultValue={name}
              ref={register({ required: true })} 
            />
          </Form.Group>
          <Form.Group controlId='formProfileDescription'>
            <Form.Label>Description:</Form.Label>
            <Form.Control 
              as="textarea" 
              rows="5"
              type="text"
              maxLength={160}
              pattern="[a-z0-9_$!@?-]{1,159}"
              placeholder="[ a-z0-9_$!@?- ]{1,159}"
              spellCheck="false"
              aria-describedby="profileDescription"
              name="newDescription"
              defaultValue={description}
              ref={register({ required: true })} 
            />
          </Form.Group>
          <Button onBlur={revertStatus} variant="dark" type="submit" block>
            {submitStatus}
          </Button>
        </Form>
      </div>
    </>
  );
}

