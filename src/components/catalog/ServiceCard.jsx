import React from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { STATIC_BASE_URL } from '../../utils/constants';

/**
 * ServiceCard — used on both LandingPage (preview) and ServicesPage (full).
 * Clicking it opens the service's products.
 */
export default function ServiceCard({ service, onSelect, compact = false }) {
  const imageUrl = service.imageUrl
    ? `${STATIC_BASE_URL}${service.imageUrl}`
    : null;

  const productCount = service.products?.length ?? 0;

  return (
    <div
      onClick={() => onSelect(service)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(14,165,233,0.2)]"
      style={{
        background:  'linear-gradient(135deg,#1E3D6E,#24487A)',
        border:      '1px solid rgba(14,165,233,0.2)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.5),transparent)' }} />

      {/* Image */}
      {imageUrl ? (
        <div className="w-full overflow-hidden" style={{ height: compact ? 140 : 180 }}>
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E3D6E] via-transparent to-transparent opacity-80" />
        </div>
      ) : (
        <div className="w-full flex items-center justify-center"
          style={{ height: compact ? 100 : 120, background: 'rgba(14,165,233,0.06)' }}>
          <span style={{ fontSize: compact ? 36 : 48 }}>🔧</span>
        </div>
      )}

      <div className={compact ? 'p-5' : 'p-6'}>
        <h3 className="font-bold text-white mb-2" style={{ fontSize: compact ? 15 : 17 }}>
          {service.name}
        </h3>

        {service.description && (
          <p className="text-slate-400 mb-3 line-clamp-2" style={{ fontSize: 13, lineHeight: 1.6 }}>
            {service.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-sky-400" />
            <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)' }}>
              {productCount} product{productCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sky-400 font-semibold transition-transform duration-200 group-hover:translate-x-1"
            style={{ fontSize: 13 }}>
            View Products <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}