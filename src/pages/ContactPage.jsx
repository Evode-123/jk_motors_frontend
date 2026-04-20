import React, { useEffect, useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import SiteNavbar from './SiteNavbar';
import SiteFooter from './SiteFooter';
import apiService from '../services/apiService';

const CONTACT_INFO = [
  { icon: '📍', label: 'Address',  value: 'Toronto, Ontario, Canada' },
  { icon: '📞', label: 'Phone',    value: '+1 (416) 555-0192' },
  { icon: '💬', label: 'WhatsApp', value: '+1 (416) 555-0192' },
  { icon: '📧', label: 'Email',    value: 'info@jkmotors.ca' },
  { icon: '🕐', label: 'Hours',    value: 'Mon–Sat: 8:00AM – 6:00PM EST' },
];

const FAQ = [
  { q: 'How quickly can you source a part?',   a: 'Most parts are sourced within 24–48 hours. Rare parts may take up to 5 business days.' },
  { q: 'Do you offer a warranty on repairs?',  a: 'Yes — all parts and labour come with a 6-month guarantee, no questions asked.' },
  { q: 'Do I need an appointment?',            a: 'Walk-ins are welcome for small jobs. For larger services, booking ahead ensures we can dedicate the right time to your vehicle.' },
  { q: 'What brands do you service?',          a: 'We work on all major brands — Toyota, Nissan, Honda, BMW, Mercedes-Benz, Kia, Hyundai, Ford, and more.' },
];

export default function ContactPage() {
  const [visible, setVisible] = useState(new Set());
  const [form, setForm]       = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus]   = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setErrorMsg('');

    try {
      await apiService.submitContact({
        name:    form.name,
        email:   form.email,
        phone:   form.phone || undefined,
        message: form.message,
      });

      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
      // Auto-clear success banner after 8 seconds
      setTimeout(() => setStatus(null), 8000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = {
    background:   'rgba(14,165,233,0.04)',
    border:       '1px solid rgba(14,165,233,0.15)',
    color:        '#e2e8f0',
    outline:      'none',
    width:        '100%',
    borderRadius: '12px',
    padding:      '12px 16px',
    fontSize:     '14px',
    fontFamily:   "'Space Grotesk', sans-serif",
    transition:   'border-color 0.2s, box-shadow 0.2s',
  };
  const onFocus = e => {
    e.target.style.borderColor = 'rgba(14,165,233,0.5)';
    e.target.style.boxShadow   = '0 0 0 3px rgba(14,165,233,0.08)';
  };
  const onBlur = e => {
    e.target.style.borderColor = 'rgba(14,165,233,0.15)';
    e.target.style.boxShadow   = 'none';
  };

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
        input::placeholder, textarea::placeholder { color: rgba(148,163,184,0.65) !important; }
      `}</style>

      <SiteNavbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 grid-pattern overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(14,165,233,0.1) 0%, transparent 55%), #162A44' }}>
        <div className="glow-orb absolute top-1/3 left-1/4 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#0EA5E9,#8B5CF6)' }} />
            <span className="font-body text-xs font-semibold text-sky-400 uppercase tracking-[3px]">Get In Touch</span>
          </div>
          <h1 className="font-tech font-black text-white leading-tight mb-6" style={{ fontSize: 'clamp(36px,6vw,72px)' }}>
            WE'D LOVE TO<br /><span className="text-grad">HEAR FROM YOU</span>
          </h1>
          <p className="font-body text-lg text-slate-400 leading-relaxed max-w-xl">
            Questions, bookings, or part requests — we're here. Reach out and we'll get back to you fast.
          </p>
        </div>
      </section>

      {/* ── CONTACT GRID ── */}
      <section className="py-24 px-6" style={{ background: '#17304C' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

          {/* Info */}
          <div id="ct-i" data-animate
            className={`transition-all duration-700 ${isVis('ct-i') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="font-body font-bold text-white text-xl mb-8">Contact Information</h2>
            {CONTACT_INFO.map(({ icon, label, value }) => (
              <div key={label} className="flex gap-3.5 items-start mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border border-sky-500/15"
                  style={{ background: 'rgba(14,165,233,0.06)' }}>{icon}</div>
                <div>
                  <div className="font-body text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-0.5">{label}</div>
                  <div className="font-body text-sm text-slate-300">{value}</div>
                </div>
              </div>
            ))}
            <div className="mt-10 rounded-2xl p-5 border border-sky-500/15" style={{ background: 'rgba(14,165,233,0.04)' }}>
              <h3 className="font-body font-semibold text-white text-sm mb-3">🗺️ Find Us</h3>
              <p className="font-body text-[13px] text-slate-400 leading-relaxed">
                Located in Toronto, Ontario, Canada.<br />
                Easily accessible by transit and with free parking on-site.
              </p>
            </div>
          </div>

          {/* Form */}
          <div id="ct-f" data-animate
            className={`transition-all duration-700 delay-200 ${isVis('ct-f') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative rounded-2xl p-7 border border-sky-600/20 overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#1E3D6E,#24487A)' }}>
              <div className="absolute top-0 left-4 right-4 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.4),transparent)' }} />
              <h3 className="font-body font-bold text-white text-lg mb-6">Send Us a Message</h3>

              {/* Success banner */}
              {status === 'success' && (
                <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <p className="font-body text-sm text-emerald-400">
                    Message sent! We'll be in touch shortly.
                  </p>
                </div>
              )}

              {/* Error banner */}
              {status === 'error' && (
                <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="font-body text-sm text-red-400">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <input
                  type="email"
                  placeholder="Your Email Address"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <input
                  type="tel"
                  placeholder="Your Phone Number (optional)"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <textarea
                  placeholder="How can we help you?"
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  style={{ ...inputBase, resize: 'vertical' }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full grad-btn font-body font-bold text-white text-[15px] py-3.5 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 transition-all"
                  style={{
                    boxShadow: '0 4px 16px rgba(14,165,233,0.25)',
                    opacity: submitting ? 0.7 : 1,
                    transform: submitting ? 'none' : undefined,
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 animate-spin"
                        style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                      Sending…
                    </>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6" style={{ background: '#1E3A58' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#0EA5E9,#8B5CF6)' }} />
              <span className="font-body text-xs font-semibold text-sky-400 uppercase tracking-[3px]">FAQ</span>
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#8B5CF6,#0EA5E9)' }} />
            </div>
            <h2 className="font-tech font-black text-white" style={{ fontSize: 'clamp(22px,4vw,40px)' }}>
              COMMON <span className="text-grad">QUESTIONS</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map(({ q, a }, i) => (
              <div key={i} className="rounded-2xl border border-sky-600/20 overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1E3D6E,#24487A)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-transparent border-none cursor-pointer text-left">
                  <span className="font-body font-semibold text-white text-[15px]">{q}</span>
                  <span className="text-sky-400 text-xl flex-shrink-0 ml-4 transition-transform duration-300"
                    style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 border-t border-sky-600/20">
                    <p className="font-body text-[14px] text-slate-400 leading-relaxed pt-3">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}