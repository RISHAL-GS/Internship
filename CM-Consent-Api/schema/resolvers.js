const Fiduciary = require('../models/Fiduciary');
const Consent = require('../models/Consent');
const { v4: uuidv4 } = require('uuid');

const resolvers = {
  Query: {
    getConsent: async (_, { consentId }) => Consent.findOne({ consentId }),
    getFiduciary: async (_, { fiduciaryId }) => Fiduciary.findOne({ fiduciaryId }),
    listConsentsByFiduciary: async (_, { fiduciaryId }) =>
      Consent.find({ fiduciaryId }),
    getAllFiduciaries: async () => await Fiduciary.find({}),
  },
  Mutation: {
    registerFiduciary: async (_, { companyName, dataRequested }) => {
      const fid = uuidv4();
      return Fiduciary.create({ fiduciaryId: fid, companyName, dataRequested });
    },
    createConsent: async (_, { fiduciaryId, agreedConsents, nonAgreedConsents }) => {
      const cid = uuidv4();
      const consent = await Consent.create({
        consentId: cid,
        fiduciaryId,
        agreedConsents,
        nonAgreedConsents,
        logs: [
          {
            action: 'created',
            details: { agreedConsents, nonAgreedConsents },
          }
        ]
      });
      return consent;
    },
    updateConsent: async (_, { consentId, agreedConsents, nonAgreedConsents }) => {
      const consent = await Consent.findOne({ consentId });
      if (!consent) throw new Error('Consent not found');
      consent.agreedConsents = agreedConsents;
      consent.nonAgreedConsents = nonAgreedConsents;
      consent.lastUpdated = new Date();
      consent.logs.push({
        action: 'updated',
        details: { agreedConsents, nonAgreedConsents },
        at: new Date()
      });
      await consent.save();
      return consent;
    },
    revokeConsent: async (_, { consentId }) => {
      const consent = await Consent.findOne({ consentId });
      if (!consent) throw new Error('Consent not found');
      consent.status = 'revoked';
      consent.logs.push({
        action: 'revoked',
        details: {},
        at: new Date()
      });
      await consent.save();
      // Notify as JSON in API result
      return consent;
    }
  }
};

module.exports = resolvers;
