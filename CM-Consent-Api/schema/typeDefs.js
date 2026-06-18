const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar JSON

  type Fiduciary {
    fiduciaryId: String!
    companyName: String!
    dataRequested: [String]
  }

  type ConsentLog {
    action: String!
    details: JSON
    at: String!
  }

  type Consent {
    consentId: String!
    fiduciaryId: String!
    agreedConsents: [String]
    nonAgreedConsents: [String]
    timestamp: String
    lastUpdated: String
    status: String
    logs: [ConsentLog]
  }

  type Query {
    getConsent(consentId: String!): Consent
    getFiduciary(fiduciaryId: String!): Fiduciary
    listConsentsByFiduciary(fiduciaryId: String!): [Consent]
    getAllFiduciaries: [Fiduciary]
  }

  type Mutation {
    registerFiduciary(companyName: String!, dataRequested: [String]!): Fiduciary
    createConsent(fiduciaryId: String!, agreedConsents: [String], nonAgreedConsents: [String]): Consent
    updateConsent(consentId: String!, agreedConsents: [String], nonAgreedConsents: [String]): Consent
    revokeConsent(consentId: String!): Consent
  }
`;

module.exports = typeDefs;
