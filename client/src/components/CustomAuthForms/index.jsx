import React, { useState, useEffect } from 'react';
import { withRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import utilStyles from '@/styles/utils.module.css';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import IndividualForm from '@/components/CustomAuthForms/IndividualForm';
import transForm from '@/components/CustomAuthForms/transForm';

function CustomAuthForms({ forms, title, submitFunction, username, login, router }) {
  const [submitStatus, setSubmitStatus] = useState(title);
  useEffect(() => {
    setSubmitStatus(title);
  }, [title]);

  const { register, handleSubmit } = useForm();

  const revertStatus = () => setSubmitStatus(title);

  const submitShowError = async (data) => {
    const prevPath = router.query;
    const req = (login)
      ? await submitFunction(data, prevPath)
      : await submitFunction(data, username);
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
}

export default withRouter(CustomAuthForms);
