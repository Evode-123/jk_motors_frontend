import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import ServiceCard from '../components/catalog/ServiceCard';
import ProductModal from '../components/catalog/ProductModal';
import apiService from '../services/apiService';

const WHY = [
  { icon: '⚡', title: 'Fast Turnaround',  desc: 'Most repairs done same day. Urgent jobs within hours.' },
  { icon: '🔒', title: '6-Month Warranty', desc: 'All parts and labour backed by our guarantee.' },
  { icon: '💎', title: 'Honest Pricing',   desc: 'No hidden fees. We quote before we work.' },
  { icon: '📱', title: 'Online Ordering',  desc: 'Order parts and book services 24/7.' },
  { icon: '🚗', title: 'All Brands',       desc: 'Toyota, Nissan, BMW, Mercedes, Kia and more.' },
  { icon: '📞', title: 'Expert Advice',    desc: 'Speak directly with our specialist.' },
];

export default function LandingPage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [visible,       setVisible]       = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Backend services state
  const [services,     setServices]     = useState([]);
  const [loadingSvc,   setLoadingSvc]   = useState(true);
  const [selectedSvc,  setSelectedSvc]  = useState(null); // opens ProductModal

  // Load up to 6 active services from backend
  useEffect(() => {
    (async () => {
      try {
        const data = await apiService.getServices();
        setServices((data || []).slice(0, 6));
      } catch {
        setServices([]);
      } finally {
        setLoadingSvc(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const footer = document.querySelector('footer');
      if (footer) setShowScrollTop(footer.getBoundingClientRect().top < window.innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVisible(p => new Set([...p, e.target.id])); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [services]); // re-observe when services load

  const isVis       = id => visible.has(id);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const revealClass = id => `transition-all duration-700 ${isVis(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  return (
    <div className="font-sans text-slate-100" style={{ background: '#1E3A58' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        .font-tech { font-family: 'Orbitron', sans-serif; }
        .font-body { font-family: 'Space Grotesk', sans-serif; }
        .text-grad { background: linear-gradient(135deg,#38BDF8 0%,#818CF8 60%,#A78BFA 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .grad-btn  { background: linear-gradient(135deg,#0EA5E9,#6366F1); }
        .grid-pattern { background-image:linear-gradient(rgba(14,165,233,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.06) 1px,transparent 1px); background-size:50px 50px; }
        @keyframes glow-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes dot-pulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes scroll-top-in { from{opacity:0;transform:translateY(20px) scale(0.8)} to{opacity:1;transform:translateY(0) scale(1)} }
        .scroll-top-btn { animation: scroll-top-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .glow-orb { animation: glow-pulse 4s ease-in-out infinite; }
        .live-dot { animation: dot-pulse 2s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #162A44; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(#0EA5E9,#6366F1); border-radius: 3px; }
      `}</style>

      <SiteNavbar transparent />

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden grid-pattern"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 30%, rgba(14,165,233,0.1) 0%, transparent 50%), #162A44' }}>
        <div className="glow-orb absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)' }} />
        <div className="glow-orb absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 65%)', animationDelay: '1.5s' }} />
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/25 mb-8 font-body"
              style={{ background: 'rgba(14,165,233,0.07)' }}>
              <div className="live-dot w-2 h-2 rounded-full bg-sky-400" style={{ boxShadow: '0 0 8px rgba(14,165,233,0.8)' }} />
              <span className="text-[13px] text-sky-400 font-medium">Toronto's Trusted Auto Parts & Service</span>
            </div>
            <h1 className="font-tech font-black leading-tight mb-4 text-white" style={{ fontSize: 'clamp(40px,7vw,80px)' }}>
              YOUR CAR<br /><span className="text-grad">DESERVES<br />THE BEST</span>
            </h1>
            <div className="w-20 h-1 rounded-full mb-7" style={{ background: 'linear-gradient(90deg,#0EA5E9,#8B5CF6)' }} />
            <p className="font-body text-lg text-slate-400 leading-relaxed max-w-xl mb-12">
              Premium spare parts, expert installation, and professional maintenance — all under one roof in Toronto. Browse freely, order when you're ready.
            </p>
            <div className="flex flex-wrap gap-4 mb-14">
              <Link to="/services"
                className="grad-btn font-body font-bold text-white px-8 py-3.5 rounded-xl border-none cursor-pointer no-underline transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: '0 4px 20px rgba(14,165,233,0.3)' }}>Browse Services</Link>
              <Link to="/about"
                className="font-body font-semibold text-sky-400 px-7 py-3 rounded-xl border border-sky-500/30 bg-transparent cursor-pointer hover:bg-sky-500/8 transition-colors no-underline">
                Learn More
              </Link>
            </div>
            <div className="flex flex-wrap gap-8">
              {['✓ Genuine Parts Only', '✓ Certified Specialist', '✓ 6-Month Warranty'].map(t => (
                <span key={t} className="font-body text-sm text-slate-400 font-medium">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => document.getElementById('preview-services')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer">
          <span className="font-body text-[10px] text-slate-400 uppercase tracking-[3px]">Scroll</span>
          <div className="w-px h-9" style={{ background: 'linear-gradient(180deg,#0EA5E9,transparent)' }} />
        </button>
      </section>

      {/* ── SERVICES PREVIEW (real from backend, max 6) ── */}
      <section id="preview-services" className="py-24 px-6" style={{ background: '#1E3A58' }}>
        <div className="max-w-6xl mx-auto">
          <div id="sv-h" data-animate className={`text-center mb-16 ${revealClass('sv-h')}`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#0EA5E9,#8B5CF6)' }} />
              <span className="font-body text-xs font-semibold text-sky-400 uppercase tracking-[3px]">What We Offer</span>
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#8B5CF6,#0EA5E9)' }} />
            </div>
            <h2 className="font-tech font-black text-white mb-3" style={{ fontSize: 'clamp(28px,5vw,52px)' }}>
              OUR <span className="text-grad">SERVICES</span>
            </h2>
            <p className="font-body text-slate-400 text-[15px] max-w-md mx-auto">
              Click any service to explore products. No account needed to browse.
            </p>
          </div>

          {/* Loading skeleton */}
          {loadingSvc && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                  style={{ background: 'linear-gradient(135deg,#1E3D6E,#24487A)', height: 260 }}>
                  <div className="h-40 bg-sky-900/30" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-sky-900/40 rounded w-3/4" />
                    <div className="h-3 bg-sky-900/30 rounded w-full" />
                    <div className="h-3 bg-sky-900/30 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Real services from backend */}
          {!loadingSvc && services.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((svc, i) => (
                <div key={svc.id} id={`sv${i}`} data-animate
                  className={`transition-all duration-700 ${isVis(`sv${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${i * 80}ms` }}>
                  <ServiceCard service={svc} onSelect={setSelectedSvc} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingSvc && services.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔧</div>
              <p className="font-body text-slate-400 text-[15px]">Services coming soon. Check back shortly!</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/services"
              className="font-body font-semibold text-sky-400 text-[14px] px-6 py-2.5 rounded-xl border border-sky-500/30 no-underline hover:bg-sky-500/8 transition-colors inline-block">
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section className="py-24 px-6" style={{ background: '#17304C' }}>
        <div className="max-w-6xl mx-auto">
          <div id="wy-h" data-animate className={`mb-14 ${revealClass('wy-h')}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#0EA5E9,#8B5CF6)' }} />
              <span className="font-body text-xs font-semibold text-sky-400 uppercase tracking-[3px]">Why JK Motors</span>
            </div>
            <h2 className="font-tech font-black text-white" style={{ fontSize: 'clamp(24px,4vw,46px)' }}>
              THE DIFFERENCE YOU'LL <span className="text-grad">FEEL</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY.map(({ icon, title, desc }, i) => (
              <div key={i} id={`wy${i}`} data-animate
                className={`rounded-2xl p-6 border border-sky-700/20 transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/30 ${isVis(`wy${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ background: 'linear-gradient(135deg,#1E3D6E,#24487A)', transitionDelay: `${i * 60}ms` }}>
                <div className="text-3xl mb-3">{icon}</div>
                <h4 className="font-body font-bold text-white text-[15px] mb-2">{title}</h4>
                <p className="font-body text-[13px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section className="py-20 px-6 text-center relative overflow-hidden border-t border-b border-sky-600/20"
          style={{ background: 'linear-gradient(135deg,#163250,#1E3D6E,#163250)' }}>
          <h2 className="font-tech font-black text-white mb-4" style={{ fontSize: 'clamp(24px,5vw,50px)' }}>READY TO GET STARTED?</h2>
          <p className="font-body text-slate-400 text-[15px] max-w-sm mx-auto mb-9">Sign up in 10 seconds — just your email and a password.</p>
          <Link to="/signup"
            className="grad-btn font-body font-bold text-white text-base px-12 py-4 rounded-2xl no-underline inline-block transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: '0 6px 28px rgba(14,165,233,0.35)' }}>Create Your Free Account</Link>
        </section>
      )}

      <SiteFooter />

      {/* ── SCROLL TO TOP ── */}
      {showScrollTop && (
        <button onClick={scrollToTop}
          className="scroll-top-btn fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-12 h-12 rounded-full border-none cursor-pointer flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', boxShadow: '0 4px 24px rgba(14,165,233,0.45)' }}
          aria-label="Scroll to top">
          <svg className="relative z-10 w-5 h-5 text-white" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* ── Product Modal (no login required to browse) ── */}
      {selectedSvc && (
        <ProductModal service={selectedSvc} onClose={() => setSelectedSvc(null)} />
      )}
    </div>
  );
}