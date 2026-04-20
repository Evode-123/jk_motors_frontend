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
    <div className="font-sans text-slate-100" style={{ background: '#1E3A58', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        .font-tech { font-family: 'Orbitron', sans-serif; }
        .font-body { font-family: 'Space Grotesk', sans-serif; }
        .text-grad { background: linear-gradient(135deg,#38BDF8 0%,#818CF8 60%,#A78BFA 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .grad-btn  { background: linear-gradient(135deg,#0EA5E9,#6366F1); }
        .grid-pattern { background-image:linear-gradient(rgba(14,165,233,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.06) 1px,transparent 1px); background-size:50px 50px; }
        @keyframes glow-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        .glow-orb { animation: glow-pulse 4s ease-in-out infinite; }
        .svc-search::placeholder { color: rgba(148,163,184,0.6); }
        .svc-search:focus { outline: none; border-color: rgba(14,165,233,0.5); box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
      `}</style>

      <SiteNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-16 px-6 grid-pattern overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(14,165,233,0.12) 0%, transparent 60%), #162A44' }}>
        <div className="glow-orb absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#0EA5E9,#8B5CF6)' }} />
            <span className="font-body text-xs font-semibold text-sky-400 uppercase tracking-[3px]">What We Offer</span>
            <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#8B5CF6,#0EA5E9)' }} />
          </div>
          <h1 className="font-tech font-black text-white leading-tight mb-4" style={{ fontSize: 'clamp(36px,6vw,72px)' }}>
            OUR <span className="text-grad">SERVICES</span>
          </h1>
          <p className="font-body text-lg text-slate-400 leading-relaxed max-w-xl mx-auto mb-8">
            Browse all services and products freely. Click any service to explore — no account needed.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="svc-search w-full pl-12 pr-4 py-3.5 rounded-xl text-sm text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}
            />
          </div>
        </div>
      </section>

      {/* ── SERVICE CARDS (all from backend) ── */}
      <section className="py-16 px-6" style={{ background: '#1E3A58' }}>
        <div className="max-w-6xl mx-auto">

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader className="w-10 h-10 text-sky-400 animate-spin" />
              <p className="font-body text-slate-400 text-sm">Loading services...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="font-body text-red-400 mb-4">{error}</p>
              <button onClick={() => window.location.reload()}
                className="font-body text-sm text-sky-400 border border-sky-500/30 px-4 py-2 rounded-lg hover:bg-sky-500/8 transition-colors">
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
                  className="font-body text-sm text-sky-400 mt-3 underline">Clear search</button>
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

          {/* Bottom CTA */}
          {!loading && !error && (
            <div className="text-center mt-14">
              <p className="font-body text-slate-400 text-sm mb-5">Don't see what you need? We source any part within 48 hours.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact"
                  className="grad-btn font-body font-bold text-white text-[15px] px-8 py-3.5 rounded-xl no-underline"
                  style={{ boxShadow: '0 4px 20px rgba(14,165,233,0.3)' }}>Contact Us</Link>
                {!user && (
                  <Link to="/signup"
                    className="font-body font-semibold text-sky-400 text-[15px] px-7 py-3 rounded-xl border border-sky-500/30 no-underline hover:bg-sky-500/8 transition-colors">
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6" style={{ background: '#17304C' }}>
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
              <div key={step} className="rounded-2xl p-6 border border-sky-600/20 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1E3D6E,#24487A)' }}>
                <div className="absolute top-3 right-4 font-tech font-black text-[40px] text-sky-900/40 leading-none select-none">{step}</div>
                <div className="text-3xl mb-4">{icon}</div>
                <h4 className="font-body font-bold text-white text-[15px] mb-2">{title}</h4>
                <p className="font-body text-[13px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Product Modal */}
      {selectedSvc && (
        <ProductModal service={selectedSvc} onClose={() => setSelectedSvc(null)} />
      )}
    </div>
  );
}