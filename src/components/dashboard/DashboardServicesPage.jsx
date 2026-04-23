import React, { useState, useEffect } from 'react';
import { Search, Loader, Package, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import ServiceCard from '../catalog/ServiceCard';
import ProductModal from '../catalog/ProductModal';

const T = {
  heading: { fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0' },
  body:    { fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0' },
  muted:   { fontFamily: "'Space Grotesk', sans-serif", color: '#64748b' },
};

const JKCard = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(30,61,110,0.4)',
    border: '1px solid rgba(14,165,233,0.15)',
    borderRadius: 16,
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
);

export default function DashboardServicesPage() {
  const navigate = useNavigate();
  const [services,    setServices]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [selectedSvc, setSelectedSvc] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getServices();
        setServices(data || []);
      } catch (err) {
        setError('Could not load services. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ ...T.heading, fontSize: 22, fontWeight: 900 }}>Browse Services</h1>
          <p style={{ ...T.muted, fontSize: 13, marginTop: 4 }}>
            Select a service to view products and place an order
          </p>
        </div>
        <button
          onClick={() => navigate('/order/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
            border: 'none', color: '#fff',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <ShoppingCart className="w-4 h-4" /> New Order
        </button>
      </div>

      {/* Search */}
      <JKCard style={{ padding: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search
            className="w-4 h-4"
            style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%)',
              color: '#38bdf8', pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 42, paddingRight: 16,
              paddingTop: 10, paddingBottom: 10,
              background: 'rgba(14,165,233,0.05)',
              border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: 10, color: '#e2e8f0', fontSize: 14,
              fontFamily: "'Space Grotesk', sans-serif", outline: 'none',
            }}
          />
        </div>
        {!loading && (
          <p style={{ ...T.muted, fontSize: 12, marginTop: 10 }}>
            {filtered.length} service{filtered.length !== 1 ? 's' : ''}
            {search ? ` matching "${search}"` : ' available'}
          </p>
        )}
      </JKCard>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(14,165,233,0.2)', borderTopColor: '#0EA5E9' }}
          />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
          }}
        >
          {error}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginLeft: 12, color: '#f87171', textDecoration: 'underline',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <JKCard style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: '#1e3d6e' }} />
          <p style={{ ...T.muted, fontSize: 13 }}>
            {search ? `No services matching "${search}".` : 'No services available yet.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                color: '#38bdf8', background: 'none', border: 'none',
                cursor: 'pointer', marginTop: 8,
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
              }}
            >
              Clear search
            </button>
          )}
        </JKCard>
      )}

      {/* Service grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(svc => (
            <ServiceCard key={svc.id} service={svc} onSelect={setSelectedSvc} />
          ))}
        </div>
      )}

      {/* How it works strip */}
      {!loading && !error && filtered.length > 0 && (
        <JKCard style={{ padding: '20px 24px' }}>
          <p style={{ ...T.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Choose a service', desc: 'Click any card to browse products' },
              { step: '02', title: 'We review & quote', desc: 'Our team sets a fair price for you' },
              { step: '03', title: 'Confirm & done',    desc: 'Approve and we come to you' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <span
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 11, fontWeight: 900,
                    color: 'rgba(14,165,233,0.4)',
                    flexShrink: 0, marginTop: 2,
                  }}
                >
                  {step}
                </span>
                <div>
                  <p style={{ ...T.body, fontSize: 13, fontWeight: 600 }}>{title}</p>
                  <p style={{ ...T.muted, fontSize: 12 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </JKCard>
      )}

      {/* Product Modal */}
      {selectedSvc && (
        <ProductModal service={selectedSvc} onClose={() => setSelectedSvc(null)} />
      )}
    </div>
  );
}
