import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SERVICES_PREVIEW = [
  { id: 1, title: 'Engine & Oil Service' },
  { id: 2, title: 'Battery & Electrical' },
  { id: 3, title: 'Brakes & Suspension' },
  { id: 4, title: 'AC & Cooling System' },
];

/**
 * SiteFooter — identical full footer used on all public pages.
 */
export default function SiteFooter() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        .sfooter-font-tech { font-family: 'Orbitron', sans-serif; }
        .sfooter-font-body { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <footer className="px-6 pt-14 pb-7 border-t border-sky-700/20" style={{ background: '#122538' }}>
        <div className="max-w-6xl mx-auto">

          {/* Top grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/jk_logo.jpeg" alt="JK Motors Logo"
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  style={{ border: '1px solid rgba(14,165,233,0.2)' }} />
                <span className="sfooter-font-tech font-black text-white text-sm tracking-widest">JK MOTORS</span>
              </div>
              <p className="sfooter-font-body text-[13px] text-slate-400 leading-relaxed max-w-[200px]">
                Your trusted partner for quality auto parts and professional vehicle servicing in Toronto, Canada.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="sfooter-font-body font-bold text-white text-xs uppercase tracking-[2px] mb-4">Quick Links</h4>
              {[['Home', '/'], ['About Us', '/about'], ['Services', '/services'], ['Contact', '/contact']].map(([label, path]) => (
                <Link key={path} to={path}
                  className="block sfooter-font-body text-[13px] text-slate-400 hover:text-sky-400 no-underline py-1 transition-colors">
                  {label}
                </Link>
              ))}
            </div>

            {/* Services */}
            <div>
              <h4 className="sfooter-font-body font-bold text-white text-xs uppercase tracking-[2px] mb-4">Services</h4>
              {SERVICES_PREVIEW.map(s => (
                <Link key={s.id} to="/services"
                  className="block sfooter-font-body text-[13px] text-slate-400 hover:text-sky-400 no-underline py-1 transition-colors">
                  {s.title}
                </Link>
              ))}
            </div>

            {/* Account */}
            <div>
              <h4 className="sfooter-font-body font-bold text-white text-xs uppercase tracking-[2px] mb-4">Account</h4>
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="block sfooter-font-body text-[13px] text-sky-400 bg-transparent border-none cursor-pointer text-left py-1"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <Link to="/signup" className="block sfooter-font-body text-[13px] text-slate-400 hover:text-sky-400 no-underline py-1 transition-colors">Create Account</Link>
                  <Link to="/login"  className="block sfooter-font-body text-[13px] text-slate-400 hover:text-sky-400 no-underline py-1 transition-colors">Sign In</Link>
                </>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-wrap justify-between items-center gap-3 pt-6 border-t border-white/10">
            <p className="sfooter-font-body text-sm text-slate-400">
              © {new Date().getFullYear()} JK Motors. All rights reserved. Toronto, Canada.
            </p>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service'].map(t => (
                <span key={t} className="sfooter-font-body text-sm text-slate-400 hover:text-sky-400 cursor-pointer transition-colors">{t}</span>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}