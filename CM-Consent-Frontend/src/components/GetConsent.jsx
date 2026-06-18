import React, { useState, useEffect } from 'react';
import { useLazyQuery, gql } from '@apollo/client';

const GET_CONSENT = gql`
  query GetConsent($consentId: String!) {
    getConsent(consentId: $consentId) {
      consentId
      fiduciaryId
      agreedConsents
      nonAgreedConsents
      status
      logs { action at details }
    }
  }
`;

export default function GetConsent({ consentId: externalConsentId }) {
  const [consentId, setConsentId] = useState(externalConsentId || '');
  const [getConsent, { data, loading, error }] = useLazyQuery(GET_CONSENT);

  // if a consentId is passed as prop, fetch automatically
  useEffect(() => {
    if (externalConsentId) {
      getConsent({ variables: { consentId: externalConsentId }, fetchPolicy: 'network-only' });
    }
  }, [externalConsentId, getConsent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    getConsent({ variables: { consentId } });
  };

  return (
    <div style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
      {!externalConsentId && (
        <>
          <h2>Get Consent by ID</h2>
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Consent ID"
              value={consentId}
              onChange={(e) => setConsentId(e.target.value)}
            />
            <button type="submit">Get Consent</button>
          </form>
        </>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}

      {data?.getConsent && (
        <div>
          <p><b>ID:</b> {data.getConsent.consentId}</p>
          <p><b>Fiduciary:</b> {data.getConsent.fiduciaryId}</p>
          <p><b>Status:</b> {data.getConsent.status}</p>
          <p><b>Agreed:</b> {data.getConsent.agreedConsents.join(', ')}</p>
          <p><b>Non-Agreed:</b> {data.getConsent.nonAgreedConsents.join(', ')}</p>
          <h4>Logs:</h4>
          {data.getConsent.logs.length > 0 ? (
            data.getConsent.logs.map((log, index) => (
              <div
                key={index}
                style={{
                  background: '#f8f8f8',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem'
                }}
              >
                <p><b>Action:</b> {log.action}</p>
                <p><b>Timestamp:</b> {new Date(parseInt(log.at)).toLocaleString()}</p>
                <p><b>Details:</b></p>
                <pre style={{
                  background: '#fff',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #eee',
                  overflowX: 'auto'
                }}>
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            ))
          ) : (
            <p>No logs available</p>
          )}
        </div>
      )}

    </div>
  );
}
