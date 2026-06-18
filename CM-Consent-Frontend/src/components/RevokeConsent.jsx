import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const REVOKE_CONSENT = gql`
  mutation RevokeConsent($consentId: String!) {
    revokeConsent(consentId: $consentId) {
      consentId
      status
      logs { action at }
    }
  }
`;

export default function RevokeConsent() {
  const [consentId, setConsentId] = useState('');
  const [revokeConsent, { data, loading, error }] = useMutation(REVOKE_CONSENT);

  const handleSubmit = e => {
    e.preventDefault();
    revokeConsent({ variables: { consentId } });
  };

  return (
    <div style={{marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem'}}>
      <h2>Revoke Consent</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Consent ID"
          value={consentId}
          onChange={e => setConsentId(e.target.value)}
        />
        <button type="submit" disabled={loading}>Revoke</button>
      </form>
      {data && <p>Consent Revoked! Status: {data.revokeConsent.status}</p>}
      {error && <p style={{color: 'red'}}>Error: {error.message}</p>}
    </div>
  );
}
