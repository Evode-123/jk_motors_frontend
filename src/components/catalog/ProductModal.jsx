import React, { useState } from 'react';
import { X, ShoppingCart, Package, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { STATIC_BASE_URL } from '../../utils/constants';

/**
 * ProductModal — slides up when user clicks a service.
 * Shows the service's products. "Place Order" → login if needed, else /order/new.
 */
export default function ProductModal({ service, onClose }) {
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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full md:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-t-3xl md:rounded-2xl"
        style={{
          background: 'linear-gradient(160deg,#0F2644,#1E3D6E)',
          border: '1px solid rgba(14,165,233,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-8 right-8 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.6),transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sky-800/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            {selected ? (
              <button onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-sky-900/30 transition-colors text-sky-400">
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}
            <div>
              <h2 className="font-bold text-white" style={{ fontSize: 18 }}>{service.name}</h2>
              <p className="text-sky-400 text-xs mt-0.5">{products.length} available product{products.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-sky-900/30 transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No products added to this service yet.</p>
              <p className="text-slate-500 text-sm mt-1">You can still order the service itself.</p>
              <button
                onClick={() => handlePlaceOrder(null)}
                className="mt-6 px-6 py-3 rounded-xl font-semibold text-white text-sm"
                style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', boxShadow: '0 4px 16px rgba(14,165,233,0.3)' }}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Order This Service
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOrder={() => handlePlaceOrder(product)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer: order whole service */}
        {products.length > 0 && (
          <div className="border-t border-sky-800/30 p-5 flex-shrink-0">
            <button
              onClick={() => handlePlaceOrder(null)}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
              style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)' }}
            >
              <ShoppingCart className="w-4 h-4" />
              Order the Full Service (let me choose product later)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onOrder }) {
  const imageUrl = product.imageUrl ? `${STATIC_BASE_URL}${product.imageUrl}` : null;

  return (
    <div
      className="rounded-xl overflow-hidden border transition-all duration-200 hover:border-sky-500/40"
      style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)' }}
    >
      {imageUrl ? (
        <div className="w-full overflow-hidden" style={{ height: 140 }}>
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full flex items-center justify-center"
          style={{ height: 100, background: 'rgba(14,165,233,0.04)' }}>
          <Package className="w-10 h-10 text-sky-800" />
        </div>
      )}
      <div className="p-4">
        <h4 className="font-semibold text-white mb-1" style={{ fontSize: 14 }}>{product.name}</h4>
        {product.description && (
          <p className="text-slate-400 line-clamp-2 mb-3" style={{ fontSize: 12, lineHeight: 1.5 }}>
            {product.description}
          </p>
        )}
        <button
          onClick={onOrder}
          className="w-full py-2 rounded-lg font-semibold text-white text-xs flex items-center justify-center gap-1.5"
          style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', boxShadow: '0 2px 10px rgba(14,165,233,0.25)' }}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Place Order
        </button>
      </div>
    </div>
  );
}