import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import utilStyles from '@/styles/utils.module.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import IndividualForm from '@/components/CustomAuthForms/IndividualForm';
import transForm from '@/components/CustomAuthForms/transForm';

const propTypes = {
  forms: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  submitFunction: PropTypes.func,
  context: PropTypes.oneOf(['login', 'signup', 'settings']),
  username: PropTypes.string,
  router: PropTypes.object
};

const CustomAuthForms = (props) => {
  const {
    forms,
    title,
    submitFunction,
    context,
    username,
    router
  } = props;

  const [submitStatus, setSubmitStatus] = useState(title);

  useEffect(() => {
    setSubmitStatus(title);
  }, [title]);

  const { register, handleSubmit } = useForm();

  const revertStatus = () => setSubmitStatus(title);

  const submitShowError = async (data) => {
    let req;
    const prevPath = router.query;

    switch (context) {
      case 'login':
        req = await submitFunction(prevPath, data);
        break;
      case 'signup':
        req = await submitFunction(data);
        break;
      case 'settings':
        req = await submitFunction(username, data);
        break;
    }

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
          {forms.map((form) => transForm(form)).map((formData) =>
            <IndividualForm key={formData.id} {...formData} title={title} register={register} />
          )}

          <Button onBlur={revertStatus} variant="dark" type="submit" block>
            {submitStatus}
          </Button>
        </Form>
      </div>
    </>
  );
};

CustomAuthForms.propTypes = propTypes;

export default withRouter(CustomAuthForms);
