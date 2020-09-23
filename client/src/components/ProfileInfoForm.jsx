import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import utilStyles from '@/styles/utils.module.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { updateProfileInfo } from '@/lib/profile';

const propTypes = {
  name: PropTypes.string,
  description: PropTypes.string,
  username: PropTypes.string
};

const ProfileInfoForm = (props) => {
  const {
    name,
    description,
    username
  } = props;

  const [ buttonState, setButtonState ] = useState({ disabled: false, text: 'Update Profile Info' });
  const { register, handleSubmit, errors } = useForm();

  const revertButtonState = () => setButtonState({ ...buttonState, text: 'Update Profile Info' });

  const onSubmit = async (data) => {
    setButtonState({ disabled: true, text: 'Sending...' });
    const req = await updateProfileInfo(username, data);

    (!req.error)
      ? setButtonState({ disabled: false, text: req.message })
      : setButtonState({ disabled: false, text: req.error });
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
        <Form className="mx-auto" onSubmit={handleSubmit(onSubmit)}>
          <Form.Group controlId='formProfileName'>
            <Form.Label>Name:
              {errors.newName &&
              <p className={`${utilStyles.formError}`}>{errors.newName.message}</p>
              }
            </Form.Label>
            <Form.Control 
              type="text"
              spellCheck="false"
              aria-describedby="profileName"
              name="newName"
              defaultValue={name}
              ref={register({
                required: true,
                pattern: {
                  value: /^[\\/\[\]\(\) a-zA-Z0-9 _'":;~%^&*$!@?#,.-]{1,49}$/,
                  message: 'Invalid characters or length (max 50). Try again'
                }
              })}
            />
          </Form.Group>

          <Form.Group controlId='formProfileDescription'>
            <Form.Label>Description:
              {errors.newDescription &&
              <p className={`${utilStyles.formError}`}>{errors.newDescription.message}</p>
              }
            </Form.Label>
            <Form.Control 
              as="textarea" 
              rows="5"
              type="text"
              spellCheck="false"
              aria-describedby="profileDescription"
              name="newDescription"
              defaultValue={description}
              ref={register({
                pattern: {
                  value: /^[\\/\[\]\(\) a-zA-Z0-9 _'":;~%^&*$!@?#,.-]{1,149}$/,
                  message: 'Invalid characters or length (max 150). Try again'
                }
              })}
            />
          </Form.Group>

          <Button onBlur={revertButtonState} variant="dark" type="submit" block disabled={buttonState.disabled}>
            {buttonState.text}
          </Button>
        </Form>
      </div>
    </>
  );
};

ProfileInfoForm.propTypes = propTypes;

export default ProfileInfoForm;
