import React, { useState, useEffect } from 'react';
import { Search, Loader, Package, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import ServiceCard from '../catalog/ServiceCard';
import ProductModal from '../catalog/ProductModal';

const G = {
  gold:        '#C9A84C',
  goldDim:     'rgba(201,168,76,0.18)',
  goldDimmer:  'rgba(201,168,76,0.09)',
  textPrimary: '#F5E4B8',
  textMuted:   'rgba(168,136,72,0.75)',
  border:      'rgba(201,168,76,0.16)',
  surface:     'rgba(28,22,9,0.6)',
};

const FONT  = { fontFamily: "'DM Sans', sans-serif" };
const SERIF = { fontFamily: "'Playfair Display', serif" };

const JKCard = ({ children, style = {} }) => (
  <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 16, overflow: 'hidden', ...style }}>
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
      } catch {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ ...SERIF, fontSize: 22, fontWeight: 700, color: G.textPrimary }}>Browse Services</h1>
          <p style={{ ...FONT, fontSize: 13, color: G.textMuted, marginTop: 4 }}>
            Select a service to view products and place an order
          </p>
        </div>
        <button
          onClick={() => navigate('/order/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg,#8B6914,#C9A84C)',
            border: 'none', color: '#1C1609',
            ...FONT, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(201,168,76,0.2)',
          }}
        >
          <ShoppingCart className="w-4 h-4" /> New Order
        </button>
      </div>

      {/* Search */}
      <JKCard style={{ padding: 16 }}>
        <div style={{ position: 'relative' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: G.gold, pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 42, paddingRight: 16,
              paddingTop: 10, paddingBottom: 10,
              background: 'rgba(20,16,8,0.8)',
              border: `1px solid ${G.goldDim}`,
              borderRadius: 10, color: G.textPrimary, fontSize: 14,
              ...FONT, outline: 'none',
            }}
          />
        </div>
        {!loading && (
          <p style={{ ...FONT, fontSize: 12, color: G.textMuted, marginTop: 10 }}>
            {filtered.length} service{filtered.length !== 1 ? 's' : ''}
            {search ? ` matching "${search}"` : ' available'}
          </p>
        )}
      </JKCard>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${G.goldDimmer}`, borderTopColor: G.gold, animation: 'jk-spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(180,60,40,0.1)', border: '1px solid rgba(180,60,40,0.25)', color: '#f87171', ...FONT, fontSize: 13 }}>
          {error}
          <button onClick={() => window.location.reload()} style={{ marginLeft: 12, color: '#f87171', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', ...FONT, fontSize: 13 }}>
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <JKCard style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: G.goldDim }} />
          <p style={{ ...FONT, fontSize: 13, color: G.textMuted }}>
            {search ? `No services matching "${search}".` : 'No services available yet.'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} style={{ color: G.gold, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, ...FONT, fontSize: 13 }}>
              Clear search
            </button>
          )}
        </JKCard>
      )}

      {/* Service grid */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
          {filtered.map(svc => (
            <ServiceCard key={svc.id} service={svc} onSelect={setSelectedSvc} />
          ))}
        </div>
      )}

      {/* How it works strip */}
      {!loading && !error && filtered.length > 0 && (
        <JKCard style={{ padding: '20px 24px' }}>
          <p style={{ ...FONT, fontSize: 11, fontWeight: 600, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            How it works
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
            {[
              { step: '01', title: 'Choose a service', desc: 'Click any card to browse products' },
              { step: '02', title: 'We review & quote', desc: 'Our team sets a fair price for you' },
              { step: '03', title: 'Confirm & done',    desc: 'Approve and we come to you' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ ...SERIF, fontSize: 13, fontWeight: 700, color: G.goldDim, flexShrink: 0, marginTop: 2 }}>{step}</span>
                <div>
                  <p style={{ ...FONT, fontSize: 13, fontWeight: 600, color: G.textPrimary }}>{title}</p>
                  <p style={{ ...FONT, fontSize: 12, color: G.textMuted }}>{desc}</p>
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