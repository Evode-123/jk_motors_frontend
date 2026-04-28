import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import ServiceCard from '../components/catalog/ServiceCard';
import ProductModal from '../components/catalog/ProductModal';
import apiService from '../services/apiService';

// ── Photo assets (Unsplash — free to use) ─────────────────────────────────────
const PHOTOS = {
  hero1:    'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=700&q=85&fit=crop',  // mechanic working
  hero2:    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&q=85&fit=crop',  // sleek car
  hero3:    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=85&fit=crop',  // engine detail
  gallery1: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop',     // red sports car
  gallery2: 'https://images.unsplash.com/photo-1504222490345-c075b7c1f0fe?w=600&q=80&fit=crop',  // garage interior
  gallery3: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=600&q=80&fit=crop',  // mechanic close-up
  gallery4: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80&fit=crop',  // night car
  gallery5: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=600&q=80&fit=crop',  // tire change
  gallery6: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop',  // person avatar
};

const WHY = [
  { icon: '⚡', title: 'Fast Turnaround',  desc: 'Most repairs done same day. Urgent jobs within hours.' },
  { icon: '🔒', title: '6-Month Warranty', desc: 'All parts and labour backed by our guarantee.' },
  { icon: '💎', title: 'Honest Pricing',   desc: 'No hidden fees. We quote before we work.' },
  { icon: '📱', title: 'Online Ordering',  desc: 'Order parts and book services 24/7.' },
  { icon: '🚗', title: 'All Brands',       desc: 'Toyota, Nissan, BMW, Mercedes, Kia and more.' },
  { icon: '📞', title: 'Expert Advice',    desc: 'Speak directly with our specialist.' },
];

const BRANDS = ['Toyota','Nissan','BMW','Mercedes-Benz','Kia','Hyundai','Honda','Ford','Lexus','Audi','Mazda','Volkswagen'];

const TESTIMONIALS = [
  { name: 'James M.', car: '2020 Toyota Camry', stars: 5, initial: 'J', color: '#C9A84C',
    text: 'Needed brake pads urgently on a Friday afternoon — JK Motors sorted it the same evening. Transparent quote, zero surprises on the bill.' },
  { name: 'Sarah K.', car: '2019 BMW 3 Series', stars: 5, initial: 'S', color: '#8B6914',
    text: 'They sourced a hard-to-find OEM part in under 24 hours when two other shops said it would take a week. Professional, fast, and completely honest.' },
  { name: 'David O.', car: '2021 Mercedes C-Class', stars: 5, initial: 'D', color: '#A07830',
    text: 'The quote was clear before any work began, and the quality matched dealership-level service at half the price. The 6-month warranty gave me total peace of mind.' },
];

const PROCESS = [
  { step:'01', icon:'🔍', title:'Browse Services', desc:'Explore our full catalog freely. No account required.' },
  { step:'02', icon:'📋', title:'Submit Order',    desc:'Tell us your vehicle and what you need. Takes 2 minutes.' },
  { step:'03', icon:'💬', title:'Confirm Quote',   desc:'We send a transparent price. You approve before any work starts.' },
  { step:'04', icon:'✅', title:'We Come to You',  desc:'Our specialist arrives at your location with parts ready.' },
];

function useCountUp(target, duration, started) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = ts => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
}

function StatNum({ val, suffix, started }) {
  const c = useCountUp(val, 1800, started);
  return <>{c.toLocaleString()}{suffix}</>;
}

export default function LandingPage() {
  const { user } = useAuth();
  const [visible,      setVisible]      = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [statsStarted,  setStatsStarted]  = useState(false);
  const [services,      setServices]      = useState([]);
  const [loadingSvc,    setLoadingSvc]    = useState(true);
  const [selectedSvc,   setSelectedSvc]   = useState(null);
  const [heroLoaded,    setHeroLoaded]    = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    (async () => {
      try { const d = await apiService.getServices(); setServices((d||[]).slice(0,6)); }
      catch { setServices([]); } finally { setLoadingSvc(false); }
    })();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const f = document.querySelector('footer');
      if (f) setShowScrollTop(f.getBoundingClientRect().top < window.innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) {
        setVisible(p => new Set([...p, e.target.id]));
        if (e.target.id === 'stats-row') setStatsStarted(true);
      }
    }), { threshold: 0.1 });
    document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [services]);

  const isVis = id => visible.has(id);
  const rev   = id => `transition-all duration-700 ${isVis(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  const STATS = [
    { val: 8,    suffix: '+', label: 'Years in Business', icon: '🏆' },
    { val: 5000, suffix: '+', label: 'Cars Serviced',     icon: '🚗' },
    { val: 50,   suffix: '+', label: 'Car Brands',        icon: '🔧' },
    { val: 100,  suffix: '%', label: 'Satisfaction Rate', icon: '⭐' },
  ];

  return (
    <div className="font-sans text-slate-100" style={{ background: '#1C1510' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        .font-tech  { font-family:'Orbitron',sans-serif }
        .font-body  { font-family:'Space Grotesk',sans-serif }
        .text-grad  { background:linear-gradient(135deg,#F0C060 0%,#C9A84C 60%,#8B6914 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text }
        .grad-btn   { background:linear-gradient(135deg,#C9A84C,#8B6914) }
        .grid-pattern { background-image:linear-gradient(rgba(201,168,76,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.05) 1px,transparent 1px);background-size:50px 50px }

        @keyframes glow-pulse  { 0%,100%{opacity:.5}50%{opacity:1} }
        @keyframes dot-pulse   { 0%,100%{opacity:1}50%{opacity:.3} }
        @keyframes marquee     { 0%{transform:translateX(0)}100%{transform:translateX(-50%)} }
        @keyframes scroll-top-in { from{opacity:0;transform:translateY(20px) scale(.8)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes float-slow  { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }
        @keyframes float-slow2 { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }
        @keyframes badge-in    { from{opacity:0;transform:translateX(20px) scale(.8)}to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes hero-fade   { from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)} }
        @keyframes photo-scale { from{transform:scale(1.08)}to{transform:scale(1)} }
        @keyframes shine       { 0%{transform:translateX(-100%) skewX(-15deg)}100%{transform:translateX(200%) skewX(-15deg)} }

        .scroll-top-btn  { animation: scroll-top-in .35s cubic-bezier(.34,1.56,.64,1) forwards }
        .glow-orb        { animation: glow-pulse 4s ease-in-out infinite }
        .live-dot        { animation: dot-pulse 2s ease-in-out infinite }
        .float-img-1     { animation: float-slow 6s ease-in-out infinite }
        .float-img-2     { animation: float-slow2 8s ease-in-out infinite 1s }
        .brand-strip     { display:flex;gap:0;animation:marquee 30s linear infinite;width:max-content }
        .brand-strip:hover { animation-play-state:paused }
        .hero-text-in    { animation: hero-fade .8s cubic-bezier(.22,1,.36,1) forwards }
        .photo-enter     { animation: photo-scale 1.2s ease forwards }

        .gallery-card:hover .gallery-overlay { opacity: 1 !important; }
        .gallery-card:hover img { transform: scale(1.06) !important; }
        .gallery-card img { transition: transform 0.6s cubic-bezier(.22,1,.36,1) !important; }

        .shine-btn::after { content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);animation:shine 3s ease-in-out infinite 2s; }
        .shine-btn { position:relative;overflow:hidden; }

        html { scroll-behavior:smooth }
        ::-webkit-scrollbar { width:5px }
        ::-webkit-scrollbar-track { background:#110C07 }
        ::-webkit-scrollbar-thumb { background:linear-gradient(#C9A84C,#8B6914);border-radius:3px }
      `}</style>

      <SiteNavbar transparent />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — Split layout with photo collage
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden grid-pattern"
        style={{ background: 'radial-gradient(ellipse at 65% 50%,rgba(201,168,76,.12) 0%,transparent 55%),radial-gradient(ellipse at 15% 30%,rgba(201,168,76,.07) 0%,transparent 50%),#18120A' }}>

        {/* Background glow orbs */}
        <div className="glow-orb absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(201,168,76,.10) 0%,transparent 65%)' }} />
        <div className="glow-orb absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 65%)', animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center">

            {/* ── LEFT: Text content ── */}
            <div style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.9s cubic-bezier(.22,1,.36,1)' }}>

              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-7"
                style={{ background: 'rgba(201,168,76,.07)', borderColor: 'rgba(201,168,76,.25)' }}>
                <div className="live-dot w-2 h-2 rounded-full" style={{ background: '#C9A84C', boxShadow: '0 0 8px rgba(201,168,76,.8)' }} />
                <span className="font-body text-[13px] font-medium" style={{ color: '#C9A84C' }}>Toronto's Trusted Auto Parts & Service</span>
              </div>

              <h1 className="font-tech font-black leading-[0.95] mb-5 text-white" style={{ fontSize: 'clamp(42px,5.5vw,76px)', letterSpacing: '-0.02em' }}>
                YOUR CAR<br />
                <span className="text-grad">DESERVES<br />THE BEST</span>
              </h1>

              <div className="w-20 h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />

              <p className="font-body text-[16px] leading-relaxed max-w-lg mb-8" style={{ color: 'rgba(203,185,150,.75)' }}>
                Premium spare parts, expert installation, and professional maintenance — right in <strong style={{ color: '#F0C060' }}>Toronto</strong>.
                We <strong style={{ color: '#F0C060' }}>come to you</strong> — no tow truck, no hassle.
              </p>

              {/* Inline trust pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {['✓ Genuine Parts', '✓ Mobile Service', '✓ 6-Month Warranty', '✓ Certified Specialist'].map(t => (
                  <span key={t} className="font-body text-[12px] font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(201,168,76,.10)', border: '1px solid rgba(201,168,76,.22)', color: 'rgba(240,192,96,.85)' }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/services"
                  className="shine-btn grad-btn font-body font-bold text-white px-9 py-4 rounded-xl no-underline transition-transform hover:-translate-y-1"
                  style={{ boxShadow: '0 6px 28px rgba(201,168,76,.4)', color: '#fff', fontSize: 15 }}>
                  Browse Services
                </Link>
                <Link to="/contact"
                  className="font-body font-semibold px-7 py-4 rounded-xl border no-underline transition-all hover:-translate-y-0.5"
                  style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,.35)', background: 'rgba(201,168,76,.05)', fontSize: 15 }}>
                  Get a Free Quote →
                </Link>
              </div>

              {/* Mini stats row */}
              <div className="flex items-center gap-6 pt-6" style={{ borderTop: '1px solid rgba(201,168,76,.12)' }}>
                {[
                  { val: '5,000+', label: 'Cars Serviced' },
                  { val: '8 yrs',  label: 'Experience' },
                  { val: '50+',    label: 'Car Brands' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-tech font-black text-xl text-grad">{s.val}</div>
                    <div className="font-body text-[11px] mt-0.5" style={{ color: 'rgba(168,136,72,.7)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Photo collage ── */}
            <div className="relative hidden lg:block" style={{
              height: 560,
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'translateY(0)' : 'translateY(24px)',
              transition: 'all 1.1s cubic-bezier(.22,1,.36,1) 0.2s',
            }}>

              {/* Main large photo */}
              <div className="float-img-1 absolute rounded-2xl overflow-hidden"
                style={{ top: 0, right: 0, width: '72%', height: 360, boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,.2)', border: '1px solid rgba(201,168,76,.15)' }}>
                <img src={PHOTOS.hero1} alt="JK Motors mechanic" className="photo-enter"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display='none'; e.target.parentElement.style.background='#2A1E0E'; }} />
                {/* Overlay gradient */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, transparent 50%, rgba(16,10,2,0.6))' }} />
              </div>

              {/* Second floating photo */}
              <div className="float-img-2 absolute rounded-2xl overflow-hidden"
                style={{ bottom: 0, left: 0, width: '52%', height: 260, boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,.25)', border: '1px solid rgba(201,168,76,.2)', zIndex: 2 }}>
                <img src={PHOTOS.hero2} alt="Premium car"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display='none'; e.target.parentElement.style.background='#2A1E0E'; }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, transparent 50%, rgba(16,10,2,0.5))' }} />
              </div>

              {/* Third small accent photo */}
              <div className="absolute rounded-xl overflow-hidden"
                style={{ bottom: 170, right: 8, width: '26%', height: 140, boxShadow: '0 16px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(201,168,76,.2)', zIndex: 3, animation: 'float-slow2 7s ease-in-out infinite 0.5s' }}>
                <img src={PHOTOS.hero3} alt="Engine detail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display='none'; e.target.parentElement.style.background='#2A1E0E'; }} />
              </div>

              {/* Floating badge — rating */}
              <div className="absolute z-10"
                style={{ top: 24, left: 0, animation: 'badge-in 0.7s cubic-bezier(.34,1.56,.64,1) 0.6s both' }}>
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(16,10,2,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(201,168,76,.3)', boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
                  <div style={{ fontSize: 22 }}>⭐</div>
                  <div>
                    <div className="font-tech font-black text-white" style={{ fontSize: 18, lineHeight: 1 }}>4.9/5</div>
                    <div className="font-body text-[10px] mt-0.5" style={{ color: 'rgba(201,168,76,.8)' }}>200+ Google Reviews</div>
                  </div>
                </div>
              </div>

              {/* Floating badge — same-day */}
              <div className="absolute z-10"
                style={{ bottom: 40, right: 0, animation: 'badge-in 0.7s cubic-bezier(.34,1.56,.64,1) 0.9s both' }}>
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(16,10,2,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(201,168,76,.3)', boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
                  <div style={{ fontSize: 22 }}>⚡</div>
                  <div>
                    <div className="font-tech font-black text-white" style={{ fontSize: 14, lineHeight: 1 }}>Same-Day</div>
                    <div className="font-body text-[10px] mt-0.5" style={{ color: 'rgba(201,168,76,.8)' }}>Most repairs</div>
                  </div>
                </div>
              </div>

              {/* Gold connecting line decoration */}
              <div style={{ position: 'absolute', top: '30%', left: '30%', width: 1, height: '25%', background: 'linear-gradient(180deg, transparent, rgba(201,168,76,.4), transparent)', zIndex: 1 }} />
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        <button onClick={() => document.getElementById('stats-row')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer">
          <span className="font-body text-[10px] text-slate-500 uppercase tracking-[3px]">Scroll</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(180deg,rgba(201,168,76,.5),transparent)' }} />
        </button>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS ROW
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="stats-row" data-animate
        style={{ background: '#161009', borderTop: '1px solid rgba(201,168,76,.15)', borderBottom: '1px solid rgba(201,168,76,.15)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map(({ val, suffix, label, icon }, i) => (
            <div key={i} className="text-center px-6 py-8 group cursor-default"
              style={{ borderRight: i < 3 ? '1px solid rgba(201,168,76,.12)' : 'none', transition: 'background 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,.04)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-tech font-black mb-1 text-grad" style={{ fontSize: 'clamp(26px,4vw,46px)' }}>
                <StatNum val={val} suffix={suffix} started={statsStarted} />
              </div>
              <div className="font-body text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TRUSTED BRANDS (marquee)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 px-6 overflow-hidden" style={{ background: '#1C1510' }}>
        <div className="text-center mb-8">
          <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>Brands We Service</span>
          <p className="font-body text-slate-500 text-sm mt-1">All major makes — domestic and imported</p>
        </div>
        <div className="overflow-hidden relative" style={{ maskImage: 'linear-gradient(90deg,transparent,black 12%,black 88%,transparent)' }}>
          <div className="brand-strip">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <div key={i} className="flex items-center justify-center px-7 py-2.5 mx-2 rounded-xl font-body font-semibold text-sm flex-shrink-0 transition-all hover:scale-105"
                style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.12)', color: 'rgba(240,192,96,.8)', minWidth: '140px', whiteSpace: 'nowrap' }}>
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PHOTO GALLERY — "Our Work"
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: '#161009' }}>
        <div className="max-w-6xl mx-auto">
          <div id="gal-h" data-animate className={`text-center mb-12 transition-all duration-700 ${isVis('gal-h') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
              <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>Our Work</span>
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#8B6914,#C9A84C)' }} />
            </div>
            <h2 className="font-tech font-black text-white mb-3" style={{ fontSize: 'clamp(26px,4vw,48px)' }}>
              QUALITY YOU CAN <span className="text-grad">SEE</span>
            </h2>
            <p className="font-body text-slate-400 text-[15px] max-w-md mx-auto">
              Every job done to dealership standard — at your location.
            </p>
          </div>

          {/* Asymmetric photo grid */}
          <div id="gal-g" data-animate
            className={`transition-all duration-700 ${isVis('gal-g') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '150ms' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gridTemplateRows: '240px 240px', gap: 12 }}>

              {/* Large left — spans 2 rows */}
              <div className="gallery-card relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ gridRow: '1 / 3', border: '1px solid rgba(201,168,76,.12)' }}>
                <img src={PHOTOS.gallery2} alt="Professional garage"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="gallery-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,transparent 40%,rgba(10,6,0,.85))', opacity: 0, transition: 'opacity 0.4s' }} />
                <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
                  <span className="font-body font-bold text-white text-[14px] px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(201,168,76,.9)', color: '#1C1609' }}>Professional Garage</span>
                </div>
              </div>

              {/* Top middle */}
              <div className="gallery-card relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ border: '1px solid rgba(201,168,76,.12)' }}>
                <img src={PHOTOS.gallery1} alt="Sports car service"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="gallery-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,0,.5)', opacity: 0, transition: 'opacity 0.4s' }} />
              </div>

              {/* Top right */}
              <div className="gallery-card relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ border: '1px solid rgba(201,168,76,.12)' }}>
                <img src={PHOTOS.gallery3} alt="Expert mechanic"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="gallery-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,0,.5)', opacity: 0, transition: 'opacity 0.4s' }} />
              </div>

              {/* Bottom middle */}
              <div className="gallery-card relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ border: '1px solid rgba(201,168,76,.12)' }}>
                <img src={PHOTOS.gallery4} alt="Night car detail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="gallery-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,0,.5)', opacity: 0, transition: 'opacity 0.4s' }} />
              </div>

              {/* Bottom right */}
              <div className="gallery-card relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ border: '1px solid rgba(201,168,76,.12)' }}>
                <img src={PHOTOS.gallery5} alt="Tire service"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="gallery-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,0,.5)', opacity: 0, transition: 'opacity 0.4s' }} />
                <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
                  <span className="font-body font-semibold text-[12px] px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(16,10,2,.9)', border: '1px solid rgba(201,168,76,.4)', color: '#C9A84C' }}>
                    Mobile Service
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SERVICES PREVIEW
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="preview-services" className="py-20 px-6" style={{ background: '#1C1510' }}>
        <div className="max-w-6xl mx-auto">
          <div id="sv-h" data-animate className={`text-center mb-14 transition-all duration-700 ${isVis('sv-h') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
              <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>What We Offer</span>
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#8B6914,#C9A84C)' }} />
            </div>
            <h2 className="font-tech font-black text-white mb-3" style={{ fontSize: 'clamp(28px,5vw,52px)' }}>
              OUR <span className="text-grad">SERVICES</span>
            </h2>
            <p className="font-body text-slate-400 text-[15px] max-w-md mx-auto">
              Click any service to explore products. No account needed to browse.
            </p>
          </div>

          {loadingSvc && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                  style={{ background: 'linear-gradient(135deg,#2A1E0E,#33250F)', height: 260 }}>
                  <div className="h-40" style={{ background: 'rgba(201,168,76,.05)' }} />
                  <div className="p-5 space-y-2">
                    <div className="h-4 rounded w-3/4" style={{ background: 'rgba(201,168,76,.10)' }} />
                    <div className="h-3 rounded w-full" style={{ background: 'rgba(201,168,76,.07)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
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
          {!loadingSvc && services.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔧</div>
              <p className="font-body text-slate-400">Services coming soon. Check back shortly!</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/services" className="font-body font-semibold text-sm px-6 py-2.5 rounded-xl border no-underline transition-all hover:-translate-y-0.5"
              style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,.3)', background: 'rgba(201,168,76,.05)' }}>
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: '#161009' }}>
        <div className="max-w-5xl mx-auto">
          <div id="how-h" data-animate className={`text-center mb-14 transition-all duration-700 ${rev('how-h')}`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
              <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>The Process</span>
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#8B6914,#C9A84C)' }} />
            </div>
            <h2 className="font-tech font-black text-white mb-3" style={{ fontSize: 'clamp(24px,4vw,46px)' }}>
              HOW IT <span className="text-grad">WORKS</span>
            </h2>
            <p className="font-body text-slate-400 text-[15px]">From browsing to a fixed car — simple and transparent every step.</p>
          </div>

          {/* Process steps with connecting line */}
          <div className="relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(201,168,76,.3),rgba(201,168,76,.3),rgba(201,168,76,.3),transparent)' }} />

            <div className="grid md:grid-cols-4 gap-5">
              {PROCESS.map(({ step, icon, title, desc }, i) => (
                <div key={step} id={`hw${i}`} data-animate
                  className={`rounded-2xl p-6 text-center relative overflow-hidden transition-all duration-700 hover:-translate-y-1 ${isVis(`hw${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ background: 'linear-gradient(135deg,#2A1E0E,#33250F)', border: '1px solid rgba(201,168,76,.15)', transitionDelay: `${i*80}ms` }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(201,168,76,.15)'}>
                  {/* Step number watermark */}
                  <div className="absolute top-3 right-4 font-tech font-black text-[40px] leading-none select-none"
                    style={{ color: 'rgba(201,168,76,.07)' }}>{step}</div>
                  {/* Step circle */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg,#8B6914,#C9A84C)', boxShadow: '0 4px 16px rgba(201,168,76,.3)' }}>
                    <span className="font-tech font-black text-xs" style={{ color: '#1C1609' }}>{step}</span>
                  </div>
                  <div className="text-2xl mb-3">{icon}</div>
                  <h4 className="font-body font-bold text-white text-sm mb-2">{title}</h4>
                  <p className="font-body text-[12px] text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          EMERGENCY BANNER
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 px-6"
        style={{ background: 'linear-gradient(135deg,#2A1E0E,#1C1510,#2A1E0E)', borderTop: '1px solid rgba(201,168,76,.2)', borderBottom: '1px solid rgba(201,168,76,.2)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.3)', boxShadow: '0 0 20px rgba(201,168,76,.15)' }}>🚨</div>
            <div>
              <div className="font-tech font-black text-white mb-1" style={{ fontSize: 14, letterSpacing: '0.05em' }}>URGENT REPAIR OR ROADSIDE ISSUE?</div>
              <div className="font-body text-slate-400 text-[13px]">We prioritize emergency calls. Available Mon–Sat, 8AM–6PM. Don't get stranded.</div>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a href="tel:+14389792548" className="shine-btn grad-btn font-body font-bold text-white text-sm px-7 py-3.5 rounded-xl no-underline transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 4px 20px rgba(201,168,76,.35)', color: '#fff' }}>📞 Call Now</a>
            <a href="https://wa.me/14389792548" target="_blank" rel="noreferrer"
              className="font-body font-semibold text-sm px-5 py-3.5 rounded-xl border no-underline transition-all hover:-translate-y-0.5"
              style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,.35)', background: 'rgba(201,168,76,.05)' }}>WhatsApp Us</a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          WHY JK MOTORS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: '#1C1510' }}>
        <div className="max-w-6xl mx-auto">
          <div id="wy-h" data-animate className={`mb-14 transition-all duration-700 ${rev('wy-h')}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
              <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>Why JK Motors</span>
            </div>
            <h2 className="font-tech font-black text-white" style={{ fontSize: 'clamp(24px,4vw,46px)' }}>
              THE DIFFERENCE YOU'LL <span className="text-grad">FEEL</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY.map(({ icon, title, desc }, i) => (
              <div key={i} id={`wy${i}`} data-animate
                className={`rounded-2xl p-6 group cursor-default transition-all duration-300 hover:-translate-y-1 ${isVis(`wy${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ background: 'linear-gradient(135deg,#2A1E0E,#33250F)', border: '1px solid rgba(201,168,76,.15)', transitionDelay: `${i*60}ms` }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(201,168,76,.15)'}>
                <div className="text-3xl mb-4"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(201,168,76,.3))' }}>{icon}</div>
                <h4 className="font-body font-bold text-white text-[15px] mb-2">{title}</h4>
                <p className="font-body text-[13px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          TESTIMONIALS — upgraded with photo avatars & quote marks
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: '#161009' }}>
        <div className="max-w-6xl mx-auto">
          <div id="test-h" data-animate className={`text-center mb-14 transition-all duration-700 ${rev('test-h')}`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
              <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>Customer Reviews</span>
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#8B6914,#C9A84C)' }} />
            </div>
            <h2 className="font-tech font-black text-white mb-3" style={{ fontSize: 'clamp(24px,4vw,46px)' }}>
              WHAT DRIVERS <span className="text-grad">SAY</span>
            </h2>
            <p className="font-body text-slate-400 text-[15px]">Real reviews from real Toronto drivers.</p>

            {/* Aggregate star display */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {[...Array(5)].map((_,i)=>(
                <span key={i} style={{ color:'#C9A84C', fontSize: 20 }}>★</span>
              ))}
              <span className="font-body font-bold text-white ml-2">4.9</span>
              <span className="font-body text-slate-500 text-sm">· 200+ reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} id={`t${i}`} data-animate
                className={`rounded-2xl p-7 relative overflow-hidden transition-all duration-500 hover:-translate-y-1 ${isVis(`t${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ background: 'linear-gradient(135deg,#2A1E0E,#33250F)', border: '1px solid rgba(201,168,76,.15)', transitionDelay: `${i*100}ms` }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(201,168,76,.15)'}>

                {/* Large decorative quote mark */}
                <div className="absolute top-4 right-5 font-tech font-black select-none"
                  style={{ fontSize: 72, color: 'rgba(201,168,76,.06)', lineHeight: 1 }}>"</div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array(t.stars).fill(0).map((_,s)=>(
                    <span key={s} style={{ color:'#C9A84C', fontSize: 15 }}>★</span>
                  ))}
                </div>

                <p className="font-body text-[14px] text-slate-300 leading-relaxed mb-6 relative z-10">"{t.text}"</p>

                {/* Author row */}
                <div className="flex items-center gap-3">
                  {/* Initials avatar with gradient */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-body font-bold text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${t.color},#C9A84C)`, color: '#1C1510', boxShadow: `0 4px 16px ${t.color}40` }}>
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-body font-semibold text-white text-sm">{t.name}</div>
                    <div className="font-body text-[12px] text-slate-500">{t.car}</div>
                  </div>
                  {/* Verified badge */}
                  <div className="ml-auto text-[10px] font-body font-semibold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(34,120,80,.15)', border: '1px solid rgba(34,120,80,.25)', color: '#6ee7b7' }}>
                    ✓ Verified
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA — only for guests
      ═══════════════════════════════════════════════════════════════════════ */}
      {!user && (
        <section className="py-24 px-6 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#161009,#2A1E0E,#161009)', borderTop: '1px solid rgba(201,168,76,.15)' }}>
          {/* background glow */}
          <div className="glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(201,168,76,.08) 0%,transparent 65%)' }} />

          <div className="max-w-xl mx-auto relative z-10">
            <div className="text-5xl mb-6">🏆</div>
            <h2 className="font-tech font-black text-white mb-4" style={{ fontSize: 'clamp(24px,5vw,48px)' }}>
              READY TO GET <span className="text-grad">STARTED?</span>
            </h2>
            <p className="font-body text-slate-400 text-[16px] leading-relaxed mb-10">
              Sign up in seconds. Browse services, place orders, and track your vehicle's full service history — all in one place.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup" className="shine-btn grad-btn font-body font-bold text-white text-base px-10 py-4 rounded-2xl no-underline transition-transform hover:-translate-y-1"
                style={{ boxShadow: '0 8px 32px rgba(201,168,76,.4)', color: '#fff', fontSize: 15 }}>
                Create Your Free Account
              </Link>
              <Link to="/services" className="font-body font-semibold text-base px-8 py-4 rounded-2xl border no-underline transition-all hover:-translate-y-0.5"
                style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,.3)', background: 'rgba(201,168,76,.05)', fontSize: 15 }}>
                Browse Services
              </Link>
            </div>
            {/* Trust line */}
            <p className="font-body text-slate-600 text-[12px] mt-8">
              No credit card required · Free to browse · Cancel anytime
            </p>
          </div>
        </section>
      )}

      <SiteFooter />

      {/* Scroll-to-top */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
          className="scroll-top-btn fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-12 h-12 rounded-full border-none cursor-pointer flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#C9A84C,#8B6914)', boxShadow: '0 4px 24px rgba(201,168,76,.5)' }}>
          <svg className="w-5 h-5" fill="none" stroke="#1C1609" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}

      {selectedSvc && <ProductModal service={selectedSvc} onClose={() => setSelectedSvc(null)} />}
    </div>
  );
}