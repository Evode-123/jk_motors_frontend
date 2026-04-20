import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * SiteNavbar — shared across LandingPage, AboutPage, ServicesPage, ContactPage.
 * Highlights the active link based on current pathname.
 * On the landing page ( / ), "HOME" is always highlighted.
 */
export default function SiteNavbar({ transparent = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparent]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const navLinks = [
    { label: 'Home',     path: '/' },
    { label: 'About',    path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Contact',  path: '/contact' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');
        .snav-font-tech { font-family: 'Orbitron', sans-serif; }
        .snav-font-body { font-family: 'Space Grotesk', sans-serif; }
        .snav-grad-btn  { background: linear-gradient(135deg,#0EA5E9,#6366F1); }
      `}</style>

      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6"
        style={{
          background: scrolled ? 'rgba(22,40,62,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(14,165,233,0.18)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between h-[70px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img src="/jk_logo.jpeg" alt="JK Motors Logo"
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              style={{ boxShadow: '0 0 16px rgba(14,165,233,0.35)', border: '1px solid rgba(14,165,233,0.25)' }} />
            <div>
              <div className="snav-font-tech font-black text-base text-white tracking-widest leading-none">JK MOTORS</div>
              <div className="snav-font-body text-[9px] text-sky-400 tracking-[3px] uppercase leading-none">Auto Parts & Service</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex gap-9">
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className="snav-font-body text-[13px] font-semibold uppercase tracking-widest no-underline transition-colors duration-200"
                style={{ color: isActive(path) ? '#38bdf8' : 'rgba(148,163,184,0.8)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                onMouseLeave={e => e.currentTarget.style.color = isActive(path) ? '#38bdf8' : 'rgba(148,163,184,0.8)'}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="snav-grad-btn snav-font-body font-semibold text-sm text-white px-5 py-2.5 rounded-lg border-none cursor-pointer transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: '0 4px 16px rgba(14,165,233,0.3)' }}
              >
                Dashboard →
              </button>
            ) : (
              <>
                <Link to="/login"
                  className="snav-font-body text-sm font-semibold text-sky-400 px-4 py-2 rounded-lg border border-sky-500/30 hover:bg-sky-500/10 transition-colors no-underline">
                  Sign In
                </Link>
                <Link to="/signup"
                  className="snav-grad-btn snav-font-body text-sm font-semibold text-white px-4 py-2.5 rounded-lg no-underline transition-transform hover:-translate-y-0.5"
                  style={{ boxShadow: '0 4px 16px rgba(14,165,233,0.3)' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col justify-center gap-1.5 md:hidden border-none cursor-pointer p-2 rounded-lg"
            style={{ background: menuOpen ? 'rgba(14,165,233,0.1)' : 'transparent' }}
            aria-label="Toggle menu"
          >
            <div className={`w-5 h-0.5 bg-sky-400 rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-5 h-0.5 bg-sky-400 rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-sky-400 rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Click-outside overlay */}
        {menuOpen && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)} />
        )}

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden border-t border-sky-700/30 relative z-50 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ background: 'rgba(18,37,56,0.98)' }}
        >
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className="block w-full text-left px-6 py-4 snav-font-body text-sm font-semibold uppercase tracking-widest border-b border-white/5 no-underline transition-colors"
              style={{ color: isActive(path) ? '#38bdf8' : 'rgba(148,163,184,0.8)' }}
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 px-6 py-5">
            {user ? (
              <button
                onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}
                className="snav-grad-btn w-full snav-font-body font-semibold text-sm text-white py-3 rounded-xl border-none cursor-pointer"
              >
                Go to Dashboard →
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="snav-font-body text-sm font-semibold text-sky-400 py-3 rounded-xl border border-sky-500/30 text-center no-underline hover:bg-sky-500/10 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)}
                  className="snav-grad-btn snav-font-body text-sm font-semibold text-white py-3 rounded-xl text-center no-underline"
                  style={{ boxShadow: '0 4px 16px rgba(14,165,233,0.3)' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}