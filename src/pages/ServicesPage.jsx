import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import ServiceCard from '../components/catalog/ServiceCard';
import ProductModal from '../components/catalog/ProductModal';
import apiService from '../services/apiService';
import { Search, Loader } from 'lucide-react';

export default function ServicesPage() {
  const { user } = useAuth();
  const [services,    setServices]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [visible,     setVisible]     = useState(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
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

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVisible(p => new Set([...p, e.target.id])); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [services]);

  const isVis = id => visible.has(id);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="font-sans text-slate-100" style={{ background: '#0D0D0D', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        .font-tech { font-family: 'Orbitron', sans-serif; }
        .font-body { font-family: 'Space Grotesk', sans-serif; }
        .text-grad { background: linear-gradient(135deg,#F0C060 0%,#C9A84C 60%,#8B6914 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .grad-btn  { background: linear-gradient(135deg,#C9A84C,#8B6914); }
        .grid-pattern { background-image:linear-gradient(rgba(201,168,76,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.06) 1px,transparent 1px); background-size:50px 50px; }
        @keyframes glow-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        .glow-orb { animation: glow-pulse 4s ease-in-out infinite; }
        .svc-search::placeholder { color: rgba(148,163,184,0.6); }
        .svc-search:focus { outline: none; border-color: rgba(201,168,76,0.5) !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.1); }
      `}</style>

      <SiteNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-16 px-6 grid-pattern overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(201,168,76,0.09) 0%, transparent 60%), #0A0A0A' }}>
        <div className="glow-orb absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
            <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>What We Offer</span>
            <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#8B6914,#C9A84C)' }} />
          </div>
          <h1 className="font-tech font-black text-white leading-tight mb-4" style={{ fontSize: 'clamp(36px,6vw,72px)' }}>
            OUR <span className="text-grad">SERVICES</span>
          </h1>
          <p className="font-body text-lg text-slate-400 leading-relaxed max-w-xl mx-auto mb-8">
            Browse all services and products freely. Click any service to explore — no account needed.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#C9A84C' }} />
            <input type="text" placeholder="Search services..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="svc-search w-full pl-12 pr-4 py-3.5 rounded-xl text-sm text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)' }} />
          </div>
        </div>
      </section>

      {/* ── SERVICE CARDS ── */}
      <section className="py-5 px-6" style={{ background: '#0D0D0D' }}>
        <div className="max-w-6xl mx-auto">

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader className="w-10 h-10 animate-spin" style={{ color: '#C9A84C' }} />
              <p className="font-body text-slate-400 text-sm">Loading services...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="font-body text-red-400 mb-4">{error}</p>
              <button onClick={() => window.location.reload()}
                className="font-body text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-body text-slate-400 text-[15px]">
                {search ? `No services matching "${search}".` : 'No services available yet.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="font-body text-sm mt-3 underline" style={{ color: '#C9A84C' }}>Clear search</button>
              )}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="font-body text-slate-400 text-sm">
                  {filtered.length} service{filtered.length !== 1 ? 's' : ''}{search ? ` matching "${search}"` : ' available'}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((svc, i) => (
                  <div key={svc.id} id={`svc-${i}`} data-animate
                    className={`transition-all duration-700 ${isVis(`svc-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${(i % 6) * 80}ms` }}>
                    <ServiceCard service={svc} onSelect={setSelectedSvc} />
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && !error && (
            <div className="text-center mt-14">
              <p className="font-body text-slate-400 text-sm mb-5">Don't see what you need? We source any part within 48 hours.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact"
                  className="grad-btn font-body font-bold text-white text-[15px] px-8 py-3.5 rounded-xl no-underline"
                  style={{ boxShadow: '0 4px 20px rgba(201,168,76,0.3)', color: '#fff' }}>Contact Us</Link>
                {!user && (
                  <Link to="/signup"
                    className="font-body font-semibold text-[15px] px-7 py-3 rounded-xl border no-underline transition-colors"
                    style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,0.3)' }}>
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6" style={{ background: '#080808' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-tech font-black text-white mb-3" style={{ fontSize: 'clamp(22px,4vw,42px)' }}>
              HOW IT <span className="text-grad">WORKS</span>
            </h2>
            <p className="font-body text-slate-400 text-[15px]">Simple, fast, transparent — every time.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📋', title: 'Browse & Choose',   desc: 'Explore our services and products freely. No account needed to browse. Select what your car needs.' },
              { step: '02', icon: '🔧', title: 'We Review & Quote', desc: 'Submit your order. Our team reviews it and sets a fair price — you confirm or reject before any work begins.' },
              { step: '03', icon: '✅', title: 'We Come to You',    desc: 'Once you confirm, our certified specialist comes to your location. Drive away with a 6-month warranty.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="rounded-2xl p-6 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1C1509,#231B0B)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div className="absolute top-3 right-4 font-tech font-black text-[40px] leading-none select-none"
                  style={{ color: 'rgba(201,168,76,0.08)' }}>{step}</div>
                <div className="text-3xl mb-4">{icon}</div>
                <h4 className="font-body font-bold text-white text-[15px] mb-2">{title}</h4>
                <p className="font-body text-[13px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />

      {selectedSvc && (
        <ProductModal service={selectedSvc} onClose={() => setSelectedSvc(null)} />
      )}
    </div>
  );
}
