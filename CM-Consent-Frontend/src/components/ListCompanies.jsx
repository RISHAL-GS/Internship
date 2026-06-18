import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_ALL_FIDUCIARIES = gql`
  query {
    getAllFiduciaries {
      fiduciaryId
      companyName
      dataRequested
    }
  }
`;

export default function ListCompanies() {
  const { data, loading, error } = useQuery(GET_ALL_FIDUCIARIES);

  return (
    <div style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
      <h2>All Registered Companies</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data && data.getAllFiduciaries.length > 0 ? (
        <ul>
          {data.getAllFiduciaries.map(company => (
            <li key={company.fiduciaryId}>
              <b>{company.companyName}</b><br />
              Fiduciary ID: <span style={{fontFamily: "monospace"}}>{company.fiduciaryId}</span><br />
              Data Requested: {company.dataRequested.join(', ')}
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No companies registered yet.</p>
      )}
    </div>
  );
}
