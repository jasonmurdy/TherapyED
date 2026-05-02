/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrandHeader, Navbar, HeroVisual, MobileNavbar } from './components/Hero';
import { Portfolio, Services } from './components/PortfolioSections';
import { BookingForm, FooterContent } from './components/BookingAndFooter';
import { ProjectDetailView } from './components/ProjectDetailView';
import { ChatWidget } from './components/ChatWidget';
import AboutPage from './pages/About';
import ServicesPage from './pages/Services';
import InquiryPage from './pages/Inquiry';
// Lazy load the AdminDashboard to reduce initial bundle size
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const PuckEditor = lazy(() => import('./components/PuckEditor').then(m => ({ default: m.PuckEditor })));
import { Shield, Loader2 } from 'lucide-react';

import { SiteContentProvider, useSiteContent } from './lib/SiteContentContext';
import { BrowserRouter, Routes, Route, useParams, useLocation, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Render } from "@measured/puck";
import { createConfig } from "./lib/puck.config";
import { Helmet } from 'react-helmet-async';
import { trackPageView } from './lib/analytics';

function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Send tracking after a short delay to allow Helmet to update document.title
    const timer = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 100);
    return () => clearTimeout(timer);
  }, [location]);
}

function isPuckPopulated(layout: any) {
  if (!layout) return false;
  // Check if there is actual content or populated zones
  const hasContent = layout.content && layout.content.length > 0;
  const hasZones = layout.zones && Object.values(layout.zones).some(
    (zone: any) => Array.isArray(zone) && zone.length > 0
  );
  return !!(hasContent || hasZones);
}

function MainLayout() {
  usePageTracking();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPuck, setShowPuck] = useState(false);
  const { isAdmin, settings, isEditMode, setIsEditMode, pages, isLight, setIsLight, loading } = useSiteContent();

  const location = useLocation();
  const slugFromPath = location.pathname.startsWith('/p/') ? location.pathname.split('/p/')[1] : null;
  const currentPage = slugFromPath ? pages.find(p => p.slug === slugFromPath) : null;

  const config = useMemo(() => createConfig(pages), [pages]);
  
  // Check if we are on a page that uses a Puck layout
  const hasPuckLayout = useMemo(() => {
    const layout = location.pathname === '/' ? settings.layout : currentPage?.layout;
    return isPuckPopulated(layout);
  }, [location.pathname, settings.layout, currentPage?.layout]);

  // Dynamic Theme Injection
  useEffect(() => {
    const root = document.documentElement;
    if (settings.backgroundColor) root.style.setProperty('--bg-primary', settings.backgroundColor);
    if (settings.textColor) root.style.setProperty('--text-primary', settings.textColor);
    if (settings.primaryColor) root.style.setProperty('--color-primary', settings.primaryColor);
    if (settings.secondaryColor) root.style.setProperty('--color-secondary', settings.secondaryColor);
    if (settings.accentColor) root.style.setProperty('--color-accent', settings.accentColor);
    if (settings.borderColor) root.style.setProperty('--border-subtle', settings.borderColor);
    if (settings.glassColor) root.style.setProperty('--glass-bg', settings.glassColor);
    
    // UI Radius
    const radiusMap = { none: '0px', sm: '4px', md: '8px', lg: '16px', full: '9999px' };
    if (settings.borderRadius) root.style.setProperty('--ui-radius', radiusMap[settings.borderRadius as keyof typeof radiusMap] || '8px');

    // Fonts
    if (settings.fontTitle) root.style.setProperty('--font-display-custom', settings.fontTitle);
    if (settings.fontBody) root.style.setProperty('--font-body-custom', settings.fontTitle);
  }, [settings]);

  useEffect(() => {
    // Hidden keyboard shortcut to open admin: Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A') {
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Attempt to scroll main area to top on route change
    window.scrollTo(0, 0);
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-2 border-brick-copper border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const renderContent = () => {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomeView config={config} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/inquiry" element={<InquiryPage />} />
          <Route path="/p/:slug" element={<DynamicPageView config={config} />} />
          <Route path="/listing/:id" element={<ProjectDetailView />} />
        </Routes>
      </AnimatePresence>
    );
  };

  return (
    <div className={`min-h-screen overflow-x-hidden bg-bg-primary text-text-primary selection:bg-brick-copper selection:text-charcoal relative transition-colors duration-500 ${isLight ? 'light' : ''}`}>
      <Navbar theme={isLight ? 'light' : 'dark'} onThemeToggle={() => setIsLight(!isLight)} />
      <MobileNavbar theme={isLight ? 'light' : 'dark'} onThemeToggle={() => setIsLight(!isLight)} />
      
      <Suspense fallback={null}>
        {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
        {showPuck && <PuckEditor pageId={currentPage?.id || undefined} onClose={() => setShowPuck(false)} />}
      </Suspense>

      {/* Admin Quick Access Trigger (Hidden but accessible) */}
      <div className="fixed bottom-8 left-8 z-[100] flex flex-col gap-4">
        {isAdmin && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            onClick={() => {
              setIsEditMode(!isEditMode);
              if (!isEditMode && (hasPuckLayout || location.pathname.startsWith('/p/'))) {
                 setShowPuck(true);
              }
            }}
            className={`p-4 rounded-full border border-brick-copper shadow-lg transition-all flex items-center gap-2 group overflow-hidden ${isEditMode ? 'bg-brick-copper text-charcoal' : 'bg-charcoal text-brick-copper'}`}
          >
            <Shield size={20} />
            <span className="text-[10px] uppercase tracking-widest font-bold max-w-0 group-hover:max-w-[150px] transition-all duration-500 whitespace-nowrap overflow-hidden">
              {isEditMode ? 'Exit Visual Editor' : 'Visual Edit Mode'}
            </span>
          </motion.button>
        )}
        <button 
          onClick={() => setShowAdmin(true)}
          className="p-4 bg-charcoal text-brick-copper rounded-full border border-brick-copper shadow-lg opacity-10 hover:opacity-100 transition-all font-sans"
        >
          <Shield size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen items-stretch">
        {hasPuckLayout ? (
          <div className="w-full flex flex-col items-stretch">
            {renderContent()}
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: BRAND & SERVICES (FALLBACK) */}
            <aside className="hidden lg:flex w-1/3 border-r border-border-subtle flex-col bg-bg-primary relative shrink-0">
              <div className="sticky top-0 h-screen flex flex-col p-8 md:p-12 lg:p-16 pt-32 lg:pt-12 no-scrollbar lg:overflow-y-auto">
                <BrandHeader theme={isLight ? 'light' : 'dark'} />
                <div className="pt-12 space-y-16">
                  <Portfolio panel="side" />
                  <Services />
                  <BookingForm />
                </div>
              </div>
            </aside>

            {/* RIGHT AREA: HERO, PORTFOLIO & BOOKING (FALLBACK) */}
            <main className="w-full lg:w-2/3 flex flex-col pt-20 lg:pt-0 min-h-screen relative flex-1">
              {renderContent()}

              {/* BOTTOM: BOOKING & FOOTER */}
              <section className="mt-auto p-8 md:p-12 lg:p-16 border-t border-border-subtle bg-text-primary/[0.01]">
                <FooterContent />
              </section>
            </main>
          </>
        )}
      </div>
      
      <ChatWidget />
    </div>
  );
}

function HomeView({ config }: { config: any }) {
  const { settings } = useSiteContent();
  
  if (isPuckPopulated(settings.layout)) {
    return <Render config={config} data={settings.layout} />;
  }

  return (
    <section className="flex flex-col flex-1">
      <Helmet>
        <title>{settings.brandName} | Therapeutic Narratives & Personal Growth</title>
        <meta name="description" content={settings.tagline} />
        <meta property="og:title" content={`${settings.brandName} | Therapeutic Space`} />
        <meta property="og:description" content={settings.tagline} />
        <meta property="og:type" content="website" />
      </Helmet>
      <HeroVisual />
      <div className="bg-bg-primary/50">
        <Portfolio key="portfolio" />
      </div>
    </section>
  );
}

function DynamicPageView({ config }: { config: any }) {
  const { slug } = useParams();
  const { pages, settings } = useSiteContent();
  const page = pages.find(p => p.slug === slug);

  if (!page) return <div className="p-16 text-center">Narrative space not found.</div>;

  const hasPuck = isPuckPopulated(page.layout);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Helmet>
        <title>{`${page.title} | ${settings.brandName}`}</title>
        <meta name="description" content={page.content?.substring(0, 160).replace(/[#*`]/g, '') || `Exploring ${page.title} with ${settings.brandName}.`} />
        <meta property="og:title" content={`${page.title} | ${settings.brandName}`} />
      </Helmet>
      
      {!hasPuck && (
        <div className="w-full px-8 md:px-12 lg:px-16 py-6 border-b border-border-subtle flex items-center gap-4 text-[10px] uppercase tracking-widest text-text-primary/60">
          <Link to="/" className="hover:text-brick-copper transition-colors">Home</Link>
          <span>/</span>
          <span className="text-text-primary">{page.title}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {hasPuck ? (
          <Render config={config} data={page.layout} />
        ) : (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 md:p-16 lg:p-24"
          >
            <h2 className="font-display text-5xl mb-12">{page.title}</h2>
            <div className="prose prose-invert max-w-none prose-p:text-text-primary/70 prose-headings:text-text-primary">
              <Markdown>{page.content}</Markdown>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
export default function App() {
  return (
    <SiteContentProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </SiteContentProvider>
  );
}
