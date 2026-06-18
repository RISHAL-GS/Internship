import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const REGISTER_FIDUCIARY = gql`
  mutation RegisterFiduciary($companyName: String!, $dataRequested: [String]!) {
    registerFiduciary(companyName: $companyName, dataRequested: $dataRequested) {
      fiduciaryId
      companyName
      dataRequested
    }
  }
`;

export default function RegisterFiduciary() {
  const [companyName, setCompanyName] = useState('');
  const [dataRequested, setDataRequested] = useState('');
  const [registerFiduciary, { data, loading, error }] = useMutation(REGISTER_FIDUCIARY);

  const handleSubmit = e => {
    e.preventDefault();
    registerFiduciary({
      variables: {
        companyName,
        dataRequested: dataRequested.split(',').map(str => str.trim()),
      }
    });
  };

  return (
    <div style={{marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem'}}>
      <h2>Register Data Fiduciary</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Company Name"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
        />
        <input
          placeholder="Data Requested (comma separated)"
          value={dataRequested}
          onChange={e => setDataRequested(e.target.value)}
        />
        <button type="submit" disabled={loading}>Register</button>
      </form>
      {data && (
        <div>
          <p>Registered! ID: <b>{data.registerFiduciary.fiduciaryId}</b></p>
        </div>
      )}
      {error && <p style={{color: 'red'}}>Error: {error.message}</p>}
    </div>
  );
}
