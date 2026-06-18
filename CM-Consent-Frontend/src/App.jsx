import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useLazyQuery, useQuery, useMutation, gql } from '@apollo/client';

// Import your existing components
import CreateConsent from './components/CreateConsent';
import GetConsent from './components/GetConsent';
import ListCompanies from './components/ListCompanies';
import ListConsents from './components/ListConsents';
import RegisterFiduciary from './components/RegisterFiduciary';
import RevokeConsent from './components/RevokeConsent';
import UpdateConsent from './components/UpdateConsent';

// GraphQL Queries and Mutations
const GET_ALL_FIDUCIARIES = gql`
  query {
    getAllFiduciaries {
      fiduciaryId
      companyName
      dataRequested
    }
  }
`;

const LIST_CONSENTS = gql`
  query ListConsents($fiduciaryId: String!) {
    listConsentsByFiduciary(fiduciaryId: $fiduciaryId) {
      consentId
      agreedConsents
      nonAgreedConsents
      status
      timestamp
      fiduciaryId
      logs {
        action
        at
        details
      }
    }
  }
`;

const REVOKE_CONSENT = gql`
  mutation RevokeConsent($consentId: String!) {
    revokeConsent(consentId: $consentId) {
      consentId
      status
      logs {
        action
        at
        details
      }
    }
  }
`;

const GET_CONSENT_LOGS = gql`
  query GetConsentLogs($consentId: String!) {
    getConsentById(consentId: $consentId) {
      consentId
      logs {
        action
        at
        details
      }
    }
  }
`;


// SVG Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const HistoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    margin: 0,
    padding: 0
  },
  sidebar: {
    width: '256px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid #e5e7eb'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff'
  },
  logoText: {
    margin: 0
  },
  logoTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0
  },
  logoSubtitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  nav: {
    flex: 1,
    padding: '16px'
  },
  navLink: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s',
    fontSize: '14px',
    textAlign: 'left',
    textDecoration: 'none',
    color: '#6b7280'
  },
  navLinkActive: {
    backgroundColor: '#f3f4f6',
    color: '#111827',
    fontWeight: '600'
  },
  main: {
    flex: 1,
    overflow: 'auto'
  },
  content: {
    padding: '32px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px'
  },
  title: {
    fontSize: '30px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  companySelector: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    alignItems: 'center'
  },
  select: {
    flex: 1,
    maxWidth: '400px',
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#6b7280',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
    maxWidth: '448px'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  searchInput: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  newButton: {
    marginLeft: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    textDecoration: 'none'
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  thead: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  th: {
    textAlign: 'left',
    padding: '16px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  td: {
    padding: '16px 24px',
    fontSize: '14px',
    color: '#111827'
  },
  trBorder: {
    borderBottom: '1px solid #f3f4f6'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500'
  },
  statusActive: {
    backgroundColor: '#10b981'
  },
  statusRevoked: {
    backgroundColor: '#ef4444'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#6b7280'
  },
  errorMessage: {
    padding: '16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px',
    marginTop: '32px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '13px',
    transition: 'all 0.2s',
    marginRight: '8px'
  },
  revokeButton: {
    backgroundColor: '#fee2e2',
    color: '#dc2626'
  },
  historyButton: {
    backgroundColor: '#e0e7ff',
    color: '#4f46e5'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
  },
  logEntry: {
    padding: '16px',
    borderLeft: '3px solid #e5e7eb',
    marginBottom: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px'
  },
  logAction: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px'
  },
  logTime: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  logDetails: {
    fontSize: '14px',
    color: '#374151'
  },
  confirmText: {
    marginBottom: '20px',
    color: '#374151'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#374151',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  },
  confirmButton: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  }
};

// Dashboard component
const Dashboard = () => {
  const [selectedFiduciaryId, setSelectedFiduciaryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [allRecentConsents, setAllRecentConsents] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  
  const { data: companiesData, loading: companiesLoading } = useQuery(GET_ALL_FIDUCIARIES);
  const [getConsents, { data: consentsData, loading: consentsLoading, error, refetch }] = useLazyQuery(LIST_CONSENTS);
  const [revokeConsent, { loading: revoking }] = useMutation(REVOKE_CONSENT);
  const [fetchConsentLogs, { data: logsData, loading: logsLoading }] = useLazyQuery(GET_CONSENT_LOGS);


  // Fetch recent consents from all companies
  useEffect(() => {
    const fetchAllConsents = async () => {
      if (!companiesData?.getAllFiduciaries) return;
      
      setLoadingRecent(true);
      const companies = companiesData.getAllFiduciaries;
      const allConsents = [];

      for (const company of companies) {
        try {
          const result = await getConsents({ 
            variables: { fiduciaryId: company.fiduciaryId },
            fetchPolicy: 'network-only'
          });
          
          if (result.data?.listConsentsByFiduciary) {
            const consentsWithCompany = result.data.listConsentsByFiduciary.map(consent => ({
              ...consent,
              companyName: company.companyName
            }));
            allConsents.push(...consentsWithCompany);
          }
        } catch (err) {
          console.error('Error fetching consents for ${company.companyName}:', err);
        }
      }

      const sorted = allConsents.sort((a, b) => {
        const timeA = parseInt(a.timestamp) || 0;
        const timeB = parseInt(b.timestamp) || 0;
        return timeB - timeA;
      }).slice(0, 10);

      setAllRecentConsents(sorted);
      setLoadingRecent(false);
    };

    if (companiesData?.getAllFiduciaries?.length > 0) {
      fetchAllConsents();
    } else {
      setLoadingRecent(false);
    }
  }, [companiesData]);

  const handleCompanyChange = (e) => {
    const fiduciaryId = e.target.value;
    setSelectedFiduciaryId(fiduciaryId);
    if (fiduciaryId) {
      getConsents({ variables: { fiduciaryId } });
    }
  };

  const handleRefresh = () => {
    if (selectedFiduciaryId && refetch) {
      refetch();
    }
    window.location.reload();
  };

  const handleShowHistory = async (consent) => {
    setSelectedConsent(consent);
    await fetchConsentLogs({ variables: { consentId: consent.consentId }, fetchPolicy: 'network-only' });
    setShowHistoryModal(true);
  };

  const handleShowRevoke = (consent) => {
    setSelectedConsent(consent);
    setShowRevokeModal(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedConsent) return;
    
    try {
      await revokeConsent({
        variables: { consentId: selectedConsent.consentId }
      });
      setShowRevokeModal(false);
      setSelectedConsent(null);
      
      // Refresh data
      if (selectedFiduciaryId) {
        refetch();
      }
      window.location.reload();
    } catch (err) {
      console.error('Error revoking consent:', err);
    }
  };

  const companies = companiesData?.getAllFiduciaries || [];
  const consents = consentsData?.listConsentsByFiduciary || [];
  
  const filteredRecentConsents = allRecentConsents.filter(consent => {
    const searchLower = searchTerm.toLowerCase();
    const companyName = (consent.companyName || '').toLowerCase();
    const agreedStr = (consent.agreedConsents || []).join(' ').toLowerCase();
    const nonAgreedStr = (consent.nonAgreedConsents || []).join(' ').toLowerCase();
    return companyName.includes(searchLower) || agreedStr.includes(searchLower) || nonAgreedStr.includes(searchLower);
  });

  const getStatusColor = (status) => {
    return status === 'active' ? styles.statusActive : styles.statusRevoked;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action) => {
    switch(action.toLowerCase()) {
      case 'created':
        return '#10b981';
      case 'updated':
        return '#f59e0b';
      case 'revoked':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={styles.content}>
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Consents</h1>
      </div>

      <div style={styles.searchBar}>
        <div style={styles.searchContainer}>
          <div style={styles.searchIcon}>
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search consents"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <Link 
          to="/create-consent"
          style={styles.newButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
        >
          <PlusIcon />
          New Consent
        </Link>
      </div>

      <div style={styles.sectionTitle}>📋 Recent Consents (Top 10)</div>
      <div style={styles.tableContainer}>
        {loadingRecent ? (
          <div style={styles.emptyState}>
            <p>Loading recent consents...</p>
          </div>
        ) : filteredRecentConsents.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{fontSize: '18px', fontWeight: '500', marginBottom: '8px'}}>
              {searchTerm ? 'No matching consents found' : 'No consents found'}
            </p>
            <p>{searchTerm ? 'Try adjusting your search terms.' : 'No companies have created any consents yet.'}</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Consent ID</th>
                <th style={styles.th}>Data Agreed</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecentConsents.map((consent, index) => (
                <tr key={consent.consentId} style={index !== filteredRecentConsents.length - 1 ? styles.trBorder : {}}>
                  <td style={{...styles.td, fontWeight: '500'}}>
                    {consent.companyName}
                  </td>
                  <td style={{...styles.td, fontFamily: 'monospace', fontSize: '12px'}}>
                    {consent.consentId.substring(0, 8)}...
                  </td>
                  <td style={styles.td}>
                    {consent.agreedConsents?.length > 0 
                      ? consent.agreedConsents.join(', ') 
                      : 'None'}
                  </td>
                  <td style={styles.td}>
                    <span style={{...styles.statusBadge, ...getStatusColor(consent.status)}}>
                      {consent.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.td}>{formatTimestamp(consent.timestamp)}</td>
                  <td style={styles.td}>
                    <div style={{display: 'flex'}}>
                      <button
                        onClick={() => handleShowHistory(consent)}
                        style={{...styles.actionButton, ...styles.historyButton}}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c7d2fe'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
                      >
                        <HistoryIcon />
                        History
                      </button>
                      {consent.status === 'active' && (
                        <button
                          onClick={() => handleShowRevoke(consent)}
                          style={{...styles.actionButton, ...styles.revokeButton}}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        >
                          <TrashIcon />
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

     
        
       

      {error && (
        <div style={styles.errorMessage}>
          Error loading consents: {error.message}
        </div>
      )}

   
           

      {/* History Modal */}
     {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Consent History</h3>
            <GetConsent consentId={selectedConsent.consentId} />
            <button onClick={() => setShowHistoryModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && selectedConsent && (
        <div style={styles.modal} onClick={() => setShowRevokeModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Revoke Consent</h3>
              <button
                onClick={() => setShowRevokeModal(false)}
                style={styles.closeButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>
            <div style={styles.confirmText}>
              <p style={{marginBottom: '12px'}}>
                Are you sure you want to revoke this consent? This action cannot be undone.
              </p>
              <div style={{padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px', marginBottom: '20px'}}>
                <p style={{margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280'}}>Consent ID</p>
                <p style={{margin: '0 0 12px 0', fontFamily: 'monospace', fontSize: '14px', color: '#111827'}}>
                  {selectedConsent.consentId}
                </p>
                <p style={{margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280'}}>Data Access Permissions</p>
                <p style={{margin: 0, fontSize: '14px', color: '#111827'}}>
                  {selectedConsent.agreedConsents?.join(', ') || 'None'}
                </p>
              </div>
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={() => setShowRevokeModal(false)}
                style={styles.cancelButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                disabled={revoking}
                style={{
                  ...styles.confirmButton,
                  opacity: revoking ? 0.6 : 1,
                  cursor: revoking ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!revoking) e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  if (!revoking) e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                {revoking ? 'Revoking...' : 'Revoke Consent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppContent = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/consents', label: 'List Consents', icon: '📋' },
    { path: '/register-fiduciary', label: 'Register Fiduciary', icon: '👤' },
    { path: '/list-companies', label: 'Companies', icon: '🏢' }
  ];

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <CheckCircleIcon />
            </div>
            <div style={styles.logoText}>
              <h2 style={styles.logoTitle}>Consent</h2>
              <p style={styles.logoSubtitle}>Manager</p>
            </div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navLink,
                ...(isActive(item.path) ? styles.navLinkActive : {})
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/consents" element={<ListConsents />} />
          <Route path="/create-consent" element={<CreateConsent />} />
          <Route path="/update-consent" element={<UpdateConsent />} />
          <Route path="/revoke-consent" element={<RevokeConsent />} />
          <Route path="/get-consent" element={<GetConsent />} />
          <Route path="/list-companies" element={<ListCompanies />} />
          <Route path="/register-fiduciary" element={<RegisterFiduciary />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}