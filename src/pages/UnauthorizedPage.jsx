import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', fontFamily: 'DM Sans, sans-serif' }}>
    <div style={{ textAlign: 'center', padding: 32 }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🚫</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Access Denied</h1>
      <p style={{ color: '#888', fontSize: 16, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
        You don't have permission to view this page.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/dashboard"
          style={{ background: 'linear-gradient(135deg, #FF6B00, #e55f00)', color: '#fff', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
          Go to Dashboard
        </Link>
        <Link to="/"
          style={{ border: '1px solid rgba(255,107,0,0.4)', color: '#FF6B00', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
          Back to Home
        </Link>
      </div>
    </div>
  </div>
);

export default UnauthorizedPage;