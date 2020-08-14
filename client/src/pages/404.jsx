import React from 'react';

export default function Custom404({statusCode, error}) {
  return (
    statusCode
      ? <h1>{statusCode} - {error}</h1>
      : <h1>404 - Not Found</h1>
  );
}

