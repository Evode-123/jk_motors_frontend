import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const BRANDS = ['Toyota','Nissan','BMW','Mercedes-Benz','Kia','Hyundai','Honda','Ford','Lexus','Audi','Mazda','Volkswagen'];

const TESTIMONIALS = [
  { name: 'James M.', car: '2020 Toyota Camry', stars: 5, initial: 'J',
    text: 'Needed brake pads urgently on a Friday afternoon — JK Motors sorted it the same evening. Transparent quote, zero surprises on the bill. Best auto service in Toronto.' },
  { name: 'Sarah K.', car: '2019 BMW 3 Series', stars: 5, initial: 'S',
    text: 'They sourced a hard-to-find OEM part in under 24 hours when two other shops said it would take a week. Professional, fast, and completely honest.' },
  { name: 'David O.', car: '2021 Mercedes C-Class', stars: 5, initial: 'D',
    text: 'The quote was clear before any work began, and the quality matched dealership-level service at half the price. The 6-month warranty gave me total peace of mind.' },
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

export default function LandingPage() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [statsStarted, setStatsStarted] = useState(false);
  const [services, setServices] = useState([]);
  const [loadingSvc, setLoadingSvc] = useState(true);
  const [selectedSvc, setSelectedSvc] = useState(null);

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
  const rev = id => `transition-all duration-700 ${isVis(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  const STATS = [
    { val: 8, suffix: '+', label: 'Years in Business' },
    { val: 5000, suffix: '+', label: 'Cars Serviced' },
    { val: 50, suffix: '+', label: 'Car Brands' },
    { val: 100, suffix: '%', label: 'Satisfaction Rate' },
  ];

  function StatNum({ val, suffix, started }) {
    const c = useCountUp(val, 1800, started);
    return <>{c.toLocaleString()}{suffix}</>;
  }

  return (
    <div className="font-sans text-slate-100" style={{ background: '#1C1510' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        .font-tech{font-family:'Orbitron',sans-serif}.font-body{font-family:'Space Grotesk',sans-serif}
        .text-grad{background:linear-gradient(135deg,#F0C060 0%,#C9A84C 60%,#8B6914 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .grad-btn{background:linear-gradient(135deg,#C9A84C,#8B6914)}
        .grid-pattern{background-image:linear-gradient(rgba(201,168,76,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.05) 1px,transparent 1px);background-size:50px 50px}
        @keyframes glow-pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes dot-pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes scroll-top-in{from{opacity:0;transform:translateY(20px) scale(.8)}to{opacity:1;transform:translateY(0) scale(1)}}
        .scroll-top-btn{animation:scroll-top-in .35s cubic-bezier(.34,1.56,.64,1) forwards}
        .glow-orb{animation:glow-pulse 4s ease-in-out infinite}
        .live-dot{animation:dot-pulse 2s ease-in-out infinite}
        .brand-strip{display:flex;gap:0;animation:marquee 30s linear infinite;width:max-content}
        .brand-strip:hover{animation-play-state:paused}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#110C07}
        ::-webkit-scrollbar-thumb{background:linear-gradient(#C9A84C,#8B6914);border-radius:3px}
      `}</style>

      <SiteNavbar transparent />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden grid-pattern"
        style={{ background: 'radial-gradient(ellipse at 70% 50%,rgba(201,168,76,.10) 0%,transparent 60%),radial-gradient(ellipse at 20% 30%,rgba(201,168,76,.07) 0%,transparent 50%),#18120A' }}>
        <div className="glow-orb absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(201,168,76,.12) 0%,transparent 65%)' }} />
        <div className="glow-orb absolute bottom-1/3 left-1/5 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(201,168,76,.08) 0%,transparent 65%)', animationDelay: '2s' }} />

        <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
                style={{ background: 'rgba(201,168,76,.07)', borderColor: 'rgba(201,168,76,.25)' }}>
              </div>
              <h1 className="font-tech font-black leading-tight mb-4 text-white" style={{ fontSize: 'clamp(38px,5.5vw,72px)' }}>
                YOUR CAR<br /><span className="text-grad">DESERVES<br />THE BEST</span>
              </h1>
              <div className="w-20 h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
              <p className="font-body text-[16px] text-slate-400 leading-relaxed max-w-lg mb-10">
                Premium spare parts, expert installation, and professional maintenance in Toronto.
                We <strong className="text-slate-200">come to you</strong> — no tow truck, no hassle.
                Browse freely, order when you're ready.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/services" className="grad-btn font-body font-bold text-white px-8 py-3.5 rounded-xl no-underline transition-transform hover:-translate-y-0.5"
                  style={{ boxShadow: '0 4px 20px rgba(201,168,76,.35)', color: '#fff' }}>Browse Services</Link>
                <Link to="/contact" className="font-body font-semibold px-7 py-3 rounded-xl border no-underline transition-colors"
                  style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,.35)', background: 'transparent' }}>Get a Free Quote →</Link>
              </div>
              <div className="flex flex-wrap gap-6">
                {['✓ Genuine Parts', '✓ Mobile Service', '✓ 6-Month Warranty', '✓ Certified Specialist'].map(t => (
                  <span key={t} className="font-body text-sm text-slate-500 font-medium">{t}</span>
                ))}
              </div>
            </div>

            {/* Right — feature card */}
            <div className="hidden md:block">
              <div className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#2A1E0E,#33250F)', border: '1px solid rgba(201,168,76,.2)' }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(201,168,76,.5),transparent)' }} />
                <h3 className="font-body font-bold text-sm mb-5 uppercase tracking-widest" style={{ color: '#C9A84C' }}>Why Drivers Choose Us</h3>
                {[
                  { icon: '🏎️', title: 'We Come to You', desc: 'At your home, office, or roadside. No tow truck needed.' },
                  { icon: '⏱️', title: 'Same-Day Repairs', desc: 'Most jobs done the same day. Urgent cases within hours.' },
                  { icon: '📋', title: 'Upfront Quoting', desc: 'Full price confirmed before we touch your car. No surprises.' },
                  { icon: '🔩', title: 'OEM-Grade Parts', desc: 'Genuine and high-quality aftermarket parts only. Nothing cheap.' },
                  { icon: '📍', title: 'Toronto-Based', desc: 'Local specialists who know Toronto roads and conditions.' },
                ].map((item, i, arr) => (
                  <div key={i} className={`flex gap-3 items-start py-3 ${i < arr.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: 'rgba(201,168,76,.1)' }}>
                    <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <div className="font-body font-semibold text-white text-[13px]">{item.title}</div>
                      <div className="font-body text-[12px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => document.getElementById('stats-row')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer">
          <span className="font-body text-[10px] text-slate-400 uppercase tracking-[3px]">Explore</span>
          <div className="w-px h-9" style={{ background: 'linear-gradient(180deg,#C9A84C,transparent)' }} />
        </button>
      </section>

      {/* ── STATS ROW ── */}
      <section id="stats-row" data-animate style={{ background: '#161009', borderTop: '1px solid rgba(201,168,76,.15)', borderBottom: '1px solid rgba(201,168,76,.15)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map(({ val, suffix, label }, i) => (
            <div key={i} className="text-center px-6 py-8" style={{ borderRight: i < 3 ? '1px solid rgba(201,168,76,.12)' : 'none' }}>
              <div className="font-tech font-black mb-1 text-grad" style={{ fontSize: 'clamp(28px,4vw,48px)' }}>
                <StatNum val={val} suffix={suffix} started={statsStarted} />
              </div>
              <div className="font-body text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUSTED BRANDS ── */}
      <section className="py-14 px-6 overflow-hidden" style={{ background: '#1C1510' }}>
        <div className="text-center mb-8">
          <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>Brands We Service</span>
          <p className="font-body text-slate-500 text-sm mt-1">All major makes — domestic and imported</p>
        </div>
        <div className="overflow-hidden relative" style={{ maskImage: 'linear-gradient(90deg,transparent,black 15%,black 85%,transparent)' }}>
          <div className="brand-strip">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <div key={i} className="flex items-center justify-center px-7 py-2.5 mx-2 rounded-xl font-body font-semibold text-sm flex-shrink-0"
                style={{ background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.12)', color: 'rgba(240,192,96,.8)', minWidth: '140px', whiteSpace: 'nowrap' }}>
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES PREVIEW ── */}
      <section id="preview-services" className="py-18 px-6" style={{ background: '#161009' }}>
        <div className="max-w-6xl mx-auto">
          <div id="sv-h" data-animate className={`text-center mb-16 ${rev('sv-h')}`}>
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
            <Link to="/services" className="font-body font-semibold text-sm px-6 py-2.5 rounded-xl border no-underline"
              style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,.3)' }}>View All Services →</Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-18 px-6" style={{ background: '#1C1510' }}>
        <div className="max-w-5xl mx-auto">
          <div id="how-h" data-animate className={`text-center mb-14 ${rev('how-h')}`}>
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
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { step:'01', icon:'🔍', title:'Browse Services', desc:'Explore our full catalog freely. No account required.' },
              { step:'02', icon:'📋', title:'Submit Order', desc:'Tell us your vehicle and what you need. Takes 2 minutes.' },
              { step:'03', icon:'💬', title:'Confirm Quote', desc:'We send a transparent price. You approve before any work starts.' },
              { step:'04', icon:'✅', title:'We Come to You', desc:'Our specialist arrives at your location with parts ready.' },
            ].map(({ step, icon, title, desc }, i) => (
              <div key={step} id={`hw${i}`} data-animate
                className={`rounded-2xl p-6 text-center relative overflow-hidden transition-all duration-700 ${isVis(`hw${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ background: 'linear-gradient(135deg,#2A1E0E,#33250F)', border: '1px solid rgba(201,168,76,.15)', transitionDelay: `${i*80}ms` }}>
                <div className="absolute top-3 right-4 font-tech font-black text-[40px] leading-none select-none" style={{ color: 'rgba(201,168,76,.07)' }}>{step}</div>
                <div className="text-3xl mb-4">{icon}</div>
                <h4 className="font-body font-bold text-white text-sm mb-2">{title}</h4>
                <p className="font-body text-[12px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMERGENCY BANNER ── */}
      <section className="py-10 px-6" style={{ background: 'linear-gradient(135deg,#2A1E0E,#1C1510,#2A1E0E)', borderTop: '1px solid rgba(201,168,76,.2)', borderBottom: '1px solid rgba(201,168,76,.2)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.3)' }}>🚨</div>
            <div>
              <div className="font-tech font-black text-white text-[14px] mb-1">URGENT REPAIR OR ROADSIDE ISSUE?</div>
              <div className="font-body text-slate-400 text-[13px]">We prioritize emergency calls. Available Mon–Sat, 8AM–6PM. Don't get stranded — call us.</div>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a href="tel:+14389792548" className="grad-btn font-body font-bold text-white text-sm px-6 py-3 rounded-xl no-underline transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: '0 4px 16px rgba(201,168,76,.3)', color: '#fff' }}>📞 Call Now</a>
            <a href="https://wa.me/14389792548" target="_blank" rel="noreferrer"
              className="font-body font-semibold text-sm px-5 py-3 rounded-xl border no-underline"
              style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,.35)', background: 'transparent' }}>WhatsApp Us</a>
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section className="py-24 px-6" style={{ background: '#161009' }}>
        <div className="max-w-6xl mx-auto">
          <div id="wy-h" data-animate className={`mb-14 ${rev('wy-h')}`}>
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
                className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${isVis(`wy${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ background: 'linear-gradient(135deg,#2A1E0E,#33250F)', border: '1px solid rgba(201,168,76,.15)', transitionDelay: `${i*60}ms` }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(201,168,76,.15)'}>
                <div className="text-3xl mb-3">{icon}</div>
                <h4 className="font-body font-bold text-white text-[15px] mb-2">{title}</h4>
                <p className="font-body text-[13px] text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6" style={{ background: '#1C1510' }}>
        <div className="max-w-6xl mx-auto">
          <div id="test-h" data-animate className={`text-center mb-14 ${rev('test-h')}`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
              <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>Customer Reviews</span>
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#8B6914,#C9A84C)' }} />
            </div>
            <h2 className="font-tech font-black text-white mb-3" style={{ fontSize: 'clamp(24px,4vw,46px)' }}>
              WHAT DRIVERS <span className="text-grad">SAY</span>
            </h2>
            <p className="font-body text-slate-400 text-[15px]">Real reviews from real Toronto drivers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} id={`t${i}`} data-animate
                className={`rounded-2xl p-7 transition-all duration-500 hover:-translate-y-1 ${isVis(`t${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ background: 'linear-gradient(135deg,#2A1E0E,#33250F)', border: '1px solid rgba(201,168,76,.15)', transitionDelay: `${i*100}ms` }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(201,168,76,.15)'}>
                <div className="flex gap-0.5 mb-4">
                  {Array(t.stars).fill(0).map((_,s)=><span key={s} style={{ color:'#C9A84C',fontSize:'15px' }}>★</span>)}
                </div>
                <p className="font-body text-[14px] text-slate-300 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-body font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#C9A84C,#8B6914)', color: '#1C1510' }}>{t.initial}</div>
                  <div>
                    <div className="font-body font-semibold text-white text-sm">{t.name}</div>
                    <div className="font-body text-[12px] text-slate-500">{t.car}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section className="py-20 px-6 text-center"
          style={{ background: 'linear-gradient(135deg,#161009,#2A1E0E,#161009)', borderTop: '1px solid rgba(201,168,76,.15)' }}>
          <div className="max-w-xl mx-auto">
            <h2 className="font-tech font-black text-white mb-4" style={{ fontSize: 'clamp(24px,5vw,48px)' }}>READY TO GET STARTED?</h2>
            <p className="font-body text-slate-400 text-[15px] mb-9">Sign up in seconds. Browse services, place orders, and track your vehicle's full service history — all in one place.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup" className="grad-btn font-body font-bold text-white text-base px-10 py-4 rounded-2xl no-underline transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: '0 6px 28px rgba(201,168,76,.35)', color: '#fff' }}>Create Your Free Account</Link>
              <Link to="/services" className="font-body font-semibold text-base px-8 py-4 rounded-2xl border no-underline"
                style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,.3)', background: 'transparent' }}>Browse Services</Link>
            </div>
          </div>
        </section>
      )}

      <SiteFooter />

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
          className="scroll-top-btn fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-12 h-12 rounded-full border-none cursor-pointer flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#C9A84C,#8B6914)', boxShadow: '0 4px 24px rgba(201,168,76,.45)' }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}

      {selectedSvc && <ProductModal service={selectedSvc} onClose={() => setSelectedSvc(null)} />}
    </div>
  );
}