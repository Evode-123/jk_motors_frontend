import React from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';   // ← UPDATED

const G = {
  gold:        '#C9A84C',
  goldDim:     'rgba(201,168,76,0.18)',
  goldDimmer:  'rgba(201,168,76,0.09)',
  textPrimary: '#F5E4B8',
  textMuted:   'rgba(168,136,72,0.75)',
  border:      'rgba(201,168,76,0.16)',
};

export default function ServiceCard({ service, onSelect, compact = false }) {
  const imageUrl     = getImageUrl(service.imageUrl);   // ← UPDATED
  const productCount = service.products?.length ?? 0;

  return (
    <div
      onClick={() => onSelect(service)}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'linear-gradient(135deg,#1C1609,#241C0A)',
        border: `1px solid ${G.border}`,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform    = 'translateY(-6px)';
        e.currentTarget.style.borderColor  = G.goldDim;
        e.currentTarget.style.boxShadow    = '0 20px 60px rgba(201,168,76,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform    = 'none';
        e.currentTarget.style.borderColor  = G.border;
        e.currentTarget.style.boxShadow    = 'none';
      }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg,transparent,${G.gold},transparent)` }} />

      {/* Image */}
      {imageUrl ? (
        <div style={{ width: '100%', overflow: 'hidden', height: compact ? 140 : 180 }}>
          <img
            src={imageUrl}
            alt={service.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: compact ? 140 : 180, background: 'linear-gradient(to top,#1C1609 0%,transparent 60%)' }} />
        </div>
      ) : (
        <div style={{ width: '100%', height: compact ? 100 : 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: G.goldDimmer }}>
          <span style={{ fontSize: compact ? 36 : 48 }}>🔧</span>
        </div>
      )}

      <div style={{ padding: compact ? 18 : 22 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: G.textPrimary, marginBottom: 8, fontSize: compact ? 15 : 17 }}>
          {service.name}
        </h3>

        {service.description && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: G.textMuted, marginBottom: 14, fontSize: 13, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {service.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Package className="w-4 h-4" style={{ color: G.gold }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: G.textMuted }}>
              {productCount} product{productCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: G.gold, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13 }}>
            View Products <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}