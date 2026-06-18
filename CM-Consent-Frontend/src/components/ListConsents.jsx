import React, { useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';

const LIST_CONSENTS = gql`
  query ListConsents($fiduciaryId: String!) {
    listConsentsByFiduciary(fiduciaryId: $fiduciaryId) {
      consentId
      agreedConsents
      nonAgreedConsents
      status
      logs {
        action
        at
        details
      }
    }
  }
`;

export default function ListConsents() {
  const [fiduciaryId, setFiduciaryId] = useState('');
  const [getConsents, { data, loading, error }] = useLazyQuery(LIST_CONSENTS);

  const handleSubmit = e => {
    e.preventDefault();
    getConsents({ variables: { fiduciaryId } });
  };

  return (
    <div style={{marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem'}}>
      <h2>List Consents by Fiduciary</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Fiduciary ID"
          value={fiduciaryId}
          onChange={e => setFiduciaryId(e.target.value)}
        />
        <button type="submit">List</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p style={{color: 'red'}}>Error: {error.message}</p>}
      {data && data.listConsentsByFiduciary.length > 0 && (
        <ul>
          {data.listConsentsByFiduciary.map(consent => (
            <li key={consent.consentId}>
              <b>{consent.consentId}</b> — status: {consent.status}
              <br />
              Agreed: {consent.agreedConsents.join(', ')}
              <br />
              Non-Agreed: {consent.nonAgreedConsents.join(', ')}
              <br />
              Actions: {consent.logs.map(l => l.action).join(', ')}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
