import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';

const WHY = [
  { icon: '⚡', title: 'Fast Turnaround',   desc: 'Most repairs done same day. Urgent jobs within hours.' },
  { icon: '🔒', title: '6-Month Warranty',  desc: 'All parts and labour backed by our guarantee.' },
  { icon: '💎', title: 'Honest Pricing',    desc: 'No hidden fees. We quote before we work.' },
  { icon: '📱', title: 'Online Ordering',   desc: 'Order parts and book services 24/7.' },
  { icon: '🚗', title: 'All Brands',        desc: 'Toyota, Nissan, BMW, Mercedes, Kia and more.' },
  { icon: '📞', title: 'Expert Advice',     desc: 'Speak directly with our specialist.' },
];

export default function AboutPage() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(p => new Set([...p, e.target.id]));
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const isVis = id => visible.has(id);
  const revealClass = id =>
    `transition-all duration-700 ${isVis(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

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
      `}</style>

      <SiteNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 grid-pattern overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.12) 0%, transparent 60%), #162A44' }}>
        <div className="glow-orb absolute top-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#0EA5E9,#8B5CF6)' }} />
            <span className="font-body text-xs font-semibold text-sky-400 uppercase tracking-[3px]">About JK Motors</span>
          </div>
          <h1 className="font-tech font-black text-white leading-tight mb-6" style={{ fontSize: 'clamp(36px,6vw,72px)' }}>
            TORONTO'S PREMIER<br /><span className="text-grad">AUTO SERVICE</span> SPECIALIST
          </h1>
          <p className="font-body text-lg text-slate-400 leading-relaxed max-w-2xl">
            Based in Toronto, JK Motors has been the go-to destination for vehicle owners who demand quality. We supply genuine spare parts and provide expert installation for all major brands.
          </p>
        </div>
      </section>
      
      {/* ── STORY ── */}
      <section className="py-24 px-6" style={{ background: '#1E3A58' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div id="story-l" data-animate className={revealClass('story-l')}>
            <h2 className="font-tech font-black text-white mb-6" style={{ fontSize: 'clamp(24px,3.5vw,42px)' }}>
              OUR <span className="text-grad">STORY</span>
            </h2>
            <p className="font-body text-[15px] text-slate-300 leading-relaxed mb-5">
              JK Motors was founded with a simple mission: provide Toronto drivers with honest, high-quality auto service and genuine parts — no runarounds, no inflated prices.
            </p>
            <p className="font-body text-[15px] text-slate-300 leading-relaxed mb-5">
              Over 8 years, we've grown into a trusted name across the city. Whether you need urgent engine repair or routine maintenance, JK Motors delivers <strong className="text-white">precision workmanship</strong> backed by a 6-month guarantee on all parts and labour.
            </p>
            <p className="font-body text-[15px] text-slate-300 leading-relaxed mb-8">
              We work on all major brands — Toyota, Nissan, BMW, Mercedes, Kia, Hyundai, Ford, and more.
            </p>
            {[
              ['🏆', 'Certified Specialist', 'Professionally trained with years of hands-on experience'],
              ['📦', 'Genuine Parts Only', 'OEM and high-quality aftermarket parts, sourced responsibly'],
              ['🚚', 'Parts Sourced Fast', 'Any part you need, sourced within 48 hours'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex gap-3.5 items-start mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border border-sky-500/20"
                  style={{ background: 'rgba(14,165,233,0.08)' }}>{icon}</div>
                <div>
                  <div className="font-body font-semibold text-white text-sm">{title}</div>
                  <div className="font-body text-[13px] text-slate-400">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div id="story-r" data-animate
            className={`transition-all duration-700 delay-200 ${isVis('story-r') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="rounded-2xl p-7 mb-4 border border-sky-600/20" style={{ background: 'linear-gradient(135deg,#1E3D6E,#24487A)' }}>
              <h3 className="font-body font-bold text-white text-base mb-5">Why Choose JK Motors?</h3>
              {[
                { icon: '⚡', title: 'Same-Day Service',     desc: 'Most jobs completed the same day you bring your vehicle in.' },
                { icon: '💬', title: 'Direct Communication', desc: 'You speak directly with the person working on your car.' },
                { icon: '🔍', title: 'Transparent Quotes',   desc: 'We give you a full quote before any work begins. No surprises.' },
              ].map((item, i, arr) => (
                <div key={i} className={`flex gap-3 items-start py-3 ${i < arr.length - 1 ? 'border-b border-white/8' : ''}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: `rgba(14,165,233,${0.1 + i * 0.06})` }}>{item.icon}</div>
                  <div>
                    <div className="font-body font-semibold text-white text-[13px]">{item.title}</div>
                    <div className="font-body text-[12px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-5 border border-sky-500/15" style={{ background: 'rgba(14,165,233,0.04)' }}>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xl">📍</span>
                <span className="font-body font-semibold text-white text-sm">Visit Us</span>
              </div>
              <p className="font-body text-[13px] text-slate-400 leading-relaxed">
                Toronto, Ontario, Canada<br />
                <span className="text-sky-400 font-semibold">Mon–Sat: 8:00AM – 6:00PM</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section className="py-24 px-6" style={{ background: '#17304C' }}>
        <div className="max-w-6xl mx-auto">
          <div id="why-h" data-animate className={`mb-14 ${revealClass('why-h')}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#0EA5E9,#8B5CF6)' }} />
              <span className="font-body text-xs font-semibold text-sky-400 uppercase tracking-[3px]">The JK Difference</span>
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
        <section className="py-20 px-6 text-center border-t border-sky-600/20"
          style={{ background: 'linear-gradient(135deg,#163250,#1E3D6E,#163250)' }}>
          <h2 className="font-tech font-black text-white mb-4" style={{ fontSize: 'clamp(22px,4vw,44px)' }}>READY TO GET STARTED?</h2>
          <p className="font-body text-slate-400 text-[15px] max-w-sm mx-auto mb-9">Sign up in 10 seconds — just your email and a password.</p>
          <Link to="/signup"
            className="grad-btn font-body font-bold text-white text-base px-12 py-4 rounded-2xl no-underline inline-block transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: '0 6px 28px rgba(14,165,233,0.35)' }}>Create Your Free Account</Link>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}