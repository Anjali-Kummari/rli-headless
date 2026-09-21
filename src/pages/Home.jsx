import { useState, useEffect } from 'react';
import { fetchContentFragments, extractItems } from '../api/aemApi';
import ContentFragmentList from '../components/ContentFragmentList';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const [fragments, setFragments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cookieDismissed, setCookieDismissed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchContentFragments()
      .then((data) => { if (!cancelled) setFragments(extractItems(data)); })
      .catch((err) => { console.error('[AEM] Failed to load content fragments:', err); if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-wrapper">
      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__brand">
            <span className="site-header__logo">RLI<sup>®</sup></span>
            <span className="site-header__tagline">DIFFERENT WORKS</span>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className="site-header__hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>

          {/* Desktop nav */}
          <nav className="site-header__nav">
            <span className="site-header__nav-link">Claims</span>
            <span className="site-header__nav-link">Careers</span>
            <span className="site-header__nav-link">Investors</span>
            <span className="site-header__nav-link">Contact</span>
            <div className="site-header__divider" />
            <span className="site-header__login">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/></svg>
              Agent/broker log in
            </span>
            <span className="site-header__login">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              Policyholder log in/payments
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </nav>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="site-header__mobile-menu">
            <span className="site-header__mobile-link">Claims</span>
            <span className="site-header__mobile-link">Careers</span>
            <span className="site-header__mobile-link">Investors</span>
            <span className="site-header__mobile-link">Contact</span>
            <div className="site-header__mobile-divider" />
            <span className="site-header__mobile-login">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/></svg>
              Agent/broker log in
            </span>
            <span className="site-header__mobile-login">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              Policyholder log in/payments
            </span>
          </div>
        )}
      </header>

      <main className="main-content">
        <h1 className="page-title">Frequently asked questions about personal umbrella insurance</h1>

        <div className="faq-container">
          {loading && <Loading />}
          {!loading && error && <ErrorMessage message={error} />}
          {!loading && !error && <ContentFragmentList fragments={fragments} />}
        </div>
      </main>

      {!cookieDismissed && (
        <div className="cookie-banner">
          <p>
            RLI uses first-party cookies and other common tracking technologies to improve our website,
            perform analytics, and prevent and investigate fraud. Your browser may give you the ability
            to control or reject certain types of cookies by configuring your browser settings. If you
            choose to block cookies or other tracking technologies, certain website features may not work.
            For additional information on how RLI uses cookies, view our{' '}
            <a href="#" className="cookie-banner__link">privacy policy</a>.
          </p>
          <button className="cookie-banner__close" onClick={() => setCookieDismissed(true)} aria-label="Dismiss">✕</button>
        </div>
      )}
    </div>
  );
}
