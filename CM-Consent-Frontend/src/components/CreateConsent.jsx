import React, { useState } from 'react';
import { useMutation, useLazyQuery, gql } from '@apollo/client';

const GET_FIDUCIARY = gql`
  query GetFiduciary($fiduciaryId: String!) {
    getFiduciary(fiduciaryId: $fiduciaryId) {
      companyName
      dataRequested
    }
  }
`;

const CREATE_CONSENT = gql`
  mutation CreateConsent($fiduciaryId: String!, $agreedConsents: [String], $nonAgreedConsents: [String]) {
    createConsent(fiduciaryId: $fiduciaryId, agreedConsents: $agreedConsents, nonAgreedConsents: $nonAgreedConsents) {
      consentId
      agreedConsents
      nonAgreedConsents
      status
    }
  }
`;

export default function CreateConsent() {
  const [fiduciaryId, setFiduciaryId] = useState('');
  const [consentChoices, setConsentChoices] = useState({});
  const [fetchFiduciary, { data: fidData, error: fidError }] = useLazyQuery(GET_FIDUCIARY);
  const [createConsent, { data: consData, loading, error }] = useMutation(CREATE_CONSENT);

  const handleFetchFiduciary = e => {
    e.preventDefault();
    fetchFiduciary({ variables: { fiduciaryId } });
  };

  const handleCheckboxChange = (field) => {
    setConsentChoices(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleCreateConsent = (e) => {
    e.preventDefault();
    if (!fidData?.getFiduciary) return;
    const { dataRequested } = fidData.getFiduciary;
    const agreedConsents = dataRequested.filter(f => consentChoices[f]);
    const nonAgreedConsents = dataRequested.filter(f => !consentChoices[f]);
    createConsent({
      variables: { fiduciaryId, agreedConsents, nonAgreedConsents }
    });
  };

  return (
    <div style={{marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem'}}>
      <h2>Create Consent (with Checkboxes)</h2>
      <form onSubmit={handleFetchFiduciary}>
        <input
          placeholder="Fiduciary ID"
          value={fiduciaryId}
          onChange={e => setFiduciaryId(e.target.value)}
        />
        <button type="submit">Load Requirements</button>
      </form>
      {fidError && <p style={{color:'red'}}>Invalid Fiduciary ID</p>}
      {fidData?.getFiduciary && (
        <form onSubmit={handleCreateConsent}>
          <p>Company: {fidData.getFiduciary.companyName}</p>
          {fidData.getFiduciary.dataRequested.map(field => (
            <div key={field}>
              <label>
                <input
                  type="checkbox"
                  checked={!!consentChoices[field]}
                  onChange={() => handleCheckboxChange(field)}
                />
                {field}
              </label>
            </div>
          ))}
          <button type="submit" disabled={loading}>Create Consent</button>
        </form>
      )}
      {consData && (
        <div>
          <p>Consent Created! ID: <b>{consData.createConsent.consentId}</b></p>
        </div>
      )}
      {error && <p style={{color: 'red'}}>Error: {error.message}</p>}
    </div>
  );
}
