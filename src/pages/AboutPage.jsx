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

const MILESTONES = [
  { year: '2016', title: 'JK Motors Founded', desc: 'Started with a simple goal: honest auto service and genuine parts for Toronto drivers. First clients served from a small shop in the city.' },
  { year: '2018', title: 'Expanded to Mobile Service', desc: 'Launched our mobile service model — bringing repairs directly to customers\' homes and offices. Eliminated the need for tow trucks.' },
  { year: '2020', title: 'Online Ordering Platform', desc: 'Built our digital catalog and ordering system so clients could browse parts and book services 24/7, even during lockdowns.' },
  { year: '2022', title: '2,500+ Cars Milestone', desc: 'Crossed 2,500 vehicles serviced. Expanded to cover all major imported and domestic brands across the Greater Toronto Area.' },
  { year: '2024', title: '5,000+ Happy Clients', desc: 'Now serving over 5,000 satisfied drivers. Launched real-time order tracking and a full customer dashboard for service history.' },
];

export default function AboutPage() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVisible(p => new Set([...p, e.target.id])); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const isVis = id => visible.has(id);
  const rev = id => `transition-all duration-700 ${isVis(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  return (
    <div className="font-sans text-slate-100" style={{ background: '#1C1510', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        .font-tech{font-family:'Orbitron',sans-serif}.font-body{font-family:'Space Grotesk',sans-serif}
        .text-grad{background:linear-gradient(135deg,#F0C060 0%,#C9A84C 60%,#8B6914 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .grad-btn{background:linear-gradient(135deg,#C9A84C,#8B6914)}
        .grid-pattern{background-image:linear-gradient(rgba(201,168,76,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.05) 1px,transparent 1px);background-size:50px 50px}
        @keyframes glow-pulse{0%,100%{opacity:.5}50%{opacity:1}}
        .glow-orb{animation:glow-pulse 4s ease-in-out infinite}
        .timeline-dot::before{content:'';position:absolute;left:-29px;top:6px;width:10px;height:10px;border-radius:50%;background:#C9A84C;box-shadow:0 0 10px rgba(201,168,76,.5)}
      `}</style>

      <SiteNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 grid-pattern overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 70% 50%,rgba(201,168,76,.09) 0%,transparent 60%),#18120A' }}>
        <div className="glow-orb absolute top-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(201,168,76,.12) 0%,transparent 65%)' }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
            <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color: '#C9A84C' }}>About JK Motors</span>
          </div>
          <h1 className="font-tech font-black text-white leading-tight mb-6" style={{ fontSize: 'clamp(36px,6vw,72px)' }}>
            TORONTO'S PREMIER<br /><span className="text-grad">AUTO SERVICE</span> SPECIALIST
          </h1>
          <p className="font-body text-lg text-slate-400 leading-relaxed max-w-2xl mb-10">
            Based in Toronto, JK Motors has been the go-to destination for vehicle owners who demand quality. Over 8 years of genuine parts, honest pricing, and mobile service.
          </p>
          {/* Quick stat pills */}
          <div className="flex flex-wrap gap-3">
            {[['8+ Years','Experience'],['5,000+','Cars Serviced'],['50+','Brands'],['6-Month','Warranty']].map(([val,lab])=>(
              <div key={lab} className="flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm"
                style={{ background:'rgba(201,168,76,.08)', border:'1px solid rgba(201,168,76,.2)' }}>
                <span className="font-bold" style={{ color:'#C9A84C' }}>{val}</span>
                <span className="text-slate-400">{lab}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="py-24 px-6" style={{ background: '#1C1510' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div id="story-l" data-animate className={rev('story-l')}>
            <h2 className="font-tech font-black text-white mb-6" style={{ fontSize: 'clamp(24px,3.5vw,42px)' }}>
              OUR <span className="text-grad">STORY</span>
            </h2>
            <p className="font-body text-[15px] text-slate-300 leading-relaxed mb-5">
              JK Motors was founded with a simple mission: provide Toronto drivers with honest, high-quality auto service and genuine parts — no runarounds, no inflated prices, no surprises.
            </p>
            <p className="font-body text-[15px] text-slate-300 leading-relaxed mb-5">
              Over 8 years, we've grown into a trusted name across the city. Whether you need urgent engine repair or routine maintenance, JK Motors delivers <strong className="text-white">precision workmanship</strong> backed by a 6-month guarantee on all parts and labour.
            </p>
            <p className="font-body text-[15px] text-slate-300 leading-relaxed mb-8">
              What makes us different? We come to <em className="not-italic font-semibold text-white">you</em>. No tow trucks, no dealership wait times. Our mobile specialists arrive at your home, office, or roadside with everything needed to get you moving again.
            </p>
            {[
              ['🏆', 'Certified Specialist', 'Professionally trained with years of hands-on experience'],
              ['📦', 'Genuine Parts Only', 'OEM and high-quality aftermarket parts, sourced responsibly'],
              ['🚚', 'Mobile Service', 'We come to your location — home, office, or roadside'],
              ['⏱️', 'Parts Sourced Fast', 'Any part you need, sourced within 24–48 hours'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex gap-3.5 items-start mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background:'rgba(201,168,76,.08)', border:'1px solid rgba(201,168,76,.2)' }}>{icon}</div>
                <div>
                  <div className="font-body font-semibold text-white text-sm">{title}</div>
                  <div className="font-body text-[13px] text-slate-400">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div id="story-r" data-animate
            className={`transition-all duration-700 delay-200 ${isVis('story-r') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="rounded-2xl p-7 mb-4" style={{ background:'linear-gradient(135deg,#2A1E0E,#33250F)', border:'1px solid rgba(201,168,76,.18)' }}>
              <h3 className="font-body font-bold text-white text-base mb-5">Why Choose JK Motors?</h3>
              {[
                { icon:'⚡', title:'Same-Day Service', desc:'Most jobs completed the same day you contact us.' },
                { icon:'💬', title:'Direct Communication', desc:'You speak directly with the person working on your car.' },
                { icon:'🔍', title:'Transparent Quotes', desc:'Full price confirmed before any work begins. No surprises.' },
                { icon:'🛡️', title:'Backed by Warranty', desc:'6-month guarantee on all parts and labour, no questions asked.' },
              ].map((item, i, arr) => (
                <div key={i} className={`flex gap-3 items-start py-3.5 ${i < arr.length-1 ? 'border-b' : ''}`}
                  style={{ borderColor:'rgba(201,168,76,.1)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background:`rgba(201,168,76,${.08+i*.03})` }}>{item.icon}</div>
                  <div>
                    <div className="font-body font-semibold text-white text-[13px]">{item.title}</div>
                    <div className="font-body text-[12px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-5" style={{ background:'rgba(201,168,76,.04)', border:'1px solid rgba(201,168,76,.12)' }}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-xl">📍</span>
                <span className="font-body font-semibold text-white text-sm">Find Us</span>
              </div>
              <p className="font-body text-[13px] text-slate-400 leading-relaxed mb-3">
                Toronto, Ontario, Canada<br />
                <span className="font-semibold" style={{ color:'#C9A84C' }}>Mon–Sat: 8:00AM – 6:00PM</span>
              </p>
              <div className="flex gap-3">
                <a href="tel:+14389792548" className="grad-btn font-body font-bold text-white text-xs px-4 py-2 rounded-lg no-underline"
                  style={{ color:'#fff' }}>📞 Call Us</a>
                <a href="https://wa.me/14389792548" target="_blank" rel="noreferrer"
                  className="font-body font-semibold text-xs px-4 py-2 rounded-lg border no-underline"
                  style={{ color:'#C9A84C', borderColor:'rgba(201,168,76,.35)', background:'transparent' }}>WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE / MILESTONES ── */}
      <section className="py-24 px-6" style={{ background:'#161009' }}>
        <div className="max-w-4xl mx-auto">
          <div id="tl-h" data-animate className={`text-center mb-16 ${rev('tl-h')}`}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background:'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
              <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color:'#C9A84C' }}>Our Journey</span>
              <div className="w-12 h-0.5 rounded-full" style={{ background:'linear-gradient(90deg,#8B6914,#C9A84C)' }} />
            </div>
            <h2 className="font-tech font-black text-white" style={{ fontSize:'clamp(24px,4vw,46px)' }}>
              8 YEARS OF <span className="text-grad">PROGRESS</span>
            </h2>
          </div>
          <div className="relative pl-8" style={{ borderLeft:'1px solid rgba(201,168,76,.2)' }}>
            {MILESTONES.map(({ year, title, desc }, i) => (
              <div key={i} id={`ml${i}`} data-animate
                className={`relative mb-10 transition-all duration-700 timeline-dot ${isVis(`ml${i}`) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay:`${i*100}ms` }}>
                <div className="flex items-start gap-4">
                  <div className="font-tech font-black text-sm flex-shrink-0 mt-1 px-3 py-1 rounded-lg"
                    style={{ background:'rgba(201,168,76,.1)', color:'#C9A84C', border:'1px solid rgba(201,168,76,.2)', minWidth:'60px', textAlign:'center' }}>{year}</div>
                  <div className="rounded-xl p-5 flex-1" style={{ background:'linear-gradient(135deg,#2A1E0E,#33250F)', border:'1px solid rgba(201,168,76,.12)' }}>
                    <h4 className="font-body font-bold text-white text-[15px] mb-2">{title}</h4>
                    <p className="font-body text-[13px] text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section className="py-24 px-6" style={{ background:'#1C1510' }}>
        <div className="max-w-6xl mx-auto">
          <div id="why-h" data-animate className={`mb-14 ${rev('why-h')}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background:'linear-gradient(90deg,#C9A84C,#8B6914)' }} />
              <span className="font-body text-xs font-semibold uppercase tracking-[3px]" style={{ color:'#C9A84C' }}>The JK Difference</span>
            </div>
            <h2 className="font-tech font-black text-white" style={{ fontSize:'clamp(24px,4vw,46px)' }}>
              THE DIFFERENCE YOU'LL <span className="text-grad">FEEL</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY.map(({ icon, title, desc }, i) => (
              <div key={i} id={`wy${i}`} data-animate
                className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${isVis(`wy${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ background:'linear-gradient(135deg,#2A1E0E,#33250F)', border:'1px solid rgba(201,168,76,.15)', transitionDelay:`${i*60}ms` }}
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

      {/* ── CTA ── */}
      {!user && (
        <section className="py-20 px-6 text-center"
          style={{ background:'linear-gradient(135deg,#161009,#2A1E0E,#161009)', borderTop:'1px solid rgba(201,168,76,.15)' }}>
          <h2 className="font-tech font-black text-white mb-4" style={{ fontSize:'clamp(22px,4vw,44px)' }}>READY TO GET STARTED?</h2>
          <p className="font-body text-slate-400 text-[15px] max-w-sm mx-auto mb-9">Sign up in seconds — just your email and a password.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="grad-btn font-body font-bold text-white text-base px-12 py-4 rounded-2xl no-underline transition-transform hover:-translate-y-0.5"
              style={{ boxShadow:'0 6px 28px rgba(201,168,76,.35)', color:'#fff' }}>Create Your Free Account</Link>
            <Link to="/contact" className="font-body font-semibold text-base px-8 py-4 rounded-2xl border no-underline"
              style={{ color:'#C9A84C', borderColor:'rgba(201,168,76,.3)', background:'transparent' }}>Contact Us</Link>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}