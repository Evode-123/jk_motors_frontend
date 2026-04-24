import React, { useState } from 'react';
import { X, ShoppingCart, Package, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUrl';   // ← UPDATED

export function ProductModal({ service, onClose }) {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [selected, setSelected] = useState(null);

  if (!service) return null;
  const products = service.products ?? [];

  const handlePlaceOrder = (product) => {
    if (!user) {
      navigate(`/login?redirect=/order/new?serviceId=${service.id}&productId=${product?.id ?? ''}`);
      return;
    }
    const params = new URLSearchParams({ serviceId: service.id });
    if (product) params.set('productId', product.id);
    navigate(`/order/new?${params.toString()}`);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        position: 'relative', width: '100%', maxWidth: 720,
        maxHeight: '90vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        borderRadius: '20px 20px 0 0',
        background: 'linear-gradient(160deg,#100D05,#1C1609)',
        border: '1px solid rgba(201,168,76,0.22)',
        boxShadow: '0 -8px 48px rgba(0,0,0,0.6)',
      }}>
        {/* Top gold accent */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg,transparent,#C9A84C,transparent)', borderRadius: 2 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(201,168,76,0.15)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {selected && (
              <button onClick={() => setSelected(null)} style={{ padding: 8, borderRadius: 10, background: 'rgba(201,168,76,0.09)', border: 'none', cursor: 'pointer', color: '#C9A84C' }}>
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#F5E4B8', fontSize: 18, margin: 0 }}>{service.name}</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#C9A84C', fontSize: 12, marginTop: 2 }}>{products.length} available product{products.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 10, background: 'rgba(201,168,76,0.09)', border: '1px solid rgba(201,168,76,0.16)', cursor: 'pointer', color: 'rgba(168,136,72,0.75)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <Package className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.2)', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(168,136,72,0.75)', marginBottom: 4 }}>No products added to this service yet.</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(168,136,72,0.5)', fontSize: 13, marginBottom: 24 }}>You can still order the service itself.</p>
              <button onClick={() => handlePlaceOrder(null)} style={{ padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#8B6914,#C9A84C)', border: 'none', color: '#1C1609', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                <ShoppingCart className="w-4 h-4 inline mr-2" />Order This Service
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} onOrder={() => handlePlaceOrder(product)} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {products.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', padding: '16px 24px', flexShrink: 0 }}>
            <button onClick={() => handlePlaceOrder(null)} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(201,168,76,0.09)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ShoppingCart className="w-4 h-4" />
              Order the Full Service (choose product later)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onOrder }) {
  const imageUrl = getImageUrl(product.imageUrl);   // ← UPDATED
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.16)', background: 'rgba(20,16,8,0.7)', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.16)'}>
      {imageUrl ? (
        <div style={{ width: '100%', height: 140, overflow: 'hidden' }}>
          <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ width: '100%', height: 100, background: 'rgba(201,168,76,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package className="w-10 h-10" style={{ color: 'rgba(201,168,76,0.2)' }} />
        </div>
      )}
      <div style={{ padding: 14 }}>
        <h4 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: '#F5E4B8', marginBottom: 6, fontSize: 14 }}>{product.name}</h4>
        {product.description && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(168,136,72,0.75)', fontSize: 12, lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}
        <button onClick={onOrder} style={{ width: '100%', padding: '9px', borderRadius: 10, background: 'linear-gradient(135deg,#8B6914,#C9A84C)', border: 'none', color: '#1C1609', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ShoppingCart className="w-3.5 h-3.5" /> Place Order
        </button>
      </div>
    </div>
  );
}

export default ProductModal;