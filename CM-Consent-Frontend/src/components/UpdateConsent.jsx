import React, { useState } from 'react';
import { useMutation, useLazyQuery, gql } from '@apollo/client';

const GET_CONSENT = gql`
  query GetConsent($consentId: String!) {
    getConsent(consentId: $consentId) {
      fiduciaryId
      agreedConsents
      nonAgreedConsents
    }
  }
`;

const GET_FIDUCIARY = gql`
  query GetFiduciary($fiduciaryId: String!) {
    getFiduciary(fiduciaryId: $fiduciaryId) {
      companyName
      dataRequested
    }
  }
`;

const UPDATE_CONSENT = gql`
  mutation UpdateConsent($consentId: String!, $agreedConsents: [String], $nonAgreedConsents: [String]) {
    updateConsent(consentId: $consentId, agreedConsents: $agreedConsents, nonAgreedConsents: $nonAgreedConsents) {
      consentId
      agreedConsents
      nonAgreedConsents
      status
    }
  }
`;

export default function UpdateConsent() {
  const [consentId, setConsentId] = useState('');
  const [fiduciaryId, setFiduciaryId] = useState('');
  const [consentChoices, setConsentChoices] = useState({});
  const [step, setStep] = useState(1);

  const [fetchConsent, { data: consData, error: consError }] = useLazyQuery(GET_CONSENT);
  const [fetchFiduciary, { data: fidData, error: fidError }] = useLazyQuery(GET_FIDUCIARY);
  const [updateConsent, { data: updateData, loading, error }] = useMutation(UPDATE_CONSENT);

  const handleFetchConsent = e => {
    e.preventDefault();
    fetchConsent({ variables: { consentId } });
  };

  React.useEffect(() => {
    if (consData?.getConsent?.fiduciaryId) {
      setFiduciaryId(consData.getConsent.fiduciaryId);
      fetchFiduciary({ variables: { fiduciaryId: consData.getConsent.fiduciaryId } });
      const agreed = consData.getConsent.agreedConsents || [];
      setConsentChoices(
        Object.fromEntries(agreed.map(k => [k, true]))
      );
      setStep(2);
    }
  }, [consData]);

  const handleCheckboxChange = (field) => {
    setConsentChoices(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleUpdateConsent = (e) => {
    e.preventDefault();
    if (!fidData?.getFiduciary) return;
    const { dataRequested } = fidData.getFiduciary;
    const agreedConsents = dataRequested.filter(f => consentChoices[f]);
    const nonAgreedConsents = dataRequested.filter(f => !consentChoices[f]);
    updateConsent({
      variables: { consentId, agreedConsents, nonAgreedConsents }
    });
  };

  return (
    <div style={{marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem'}}>
      <h2>Update Consent</h2>
      {step === 1 && (
        <form onSubmit={handleFetchConsent}>
          <input
            placeholder="Consent ID"
            value={consentId}
            onChange={e => setConsentId(e.target.value)}
          />
          <button type="submit">Load Consent</button>
        </form>
      )}
      {consError && <p style={{color: 'red'}}>Invalid Consent ID</p>}
      {step === 2 && fidData?.getFiduciary && (
        <form onSubmit={handleUpdateConsent}>
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
          <button type="submit" disabled={loading}>Update Consent</button>
        </form>
      )}
      {updateData && (
        <div>
          <p>Consent Updated!</p>
        </div>
      )}
      {error && <p style={{color: 'red'}}>Error: {error.message}</p>}
    </div>
  );
}
