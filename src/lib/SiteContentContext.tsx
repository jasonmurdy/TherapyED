import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ADMIN_EMAILS } from '../constants';
import { handleFirestoreError, OperationType } from './firestoreError';

interface SiteSettings {
  brandName: string;
  logoText: string;
  logoLight?: string;
  logoDark?: string;
  tagline: string;
  heroTitlePart1: string;
  heroTitlePart2: string;
  heroTitleAccent: string;
  heroImage?: string;
  heroAlignment?: 'left' | 'center';
  accentColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  glassColor?: string;
  footerQuote: string;
  inquiryTitle?: string;
  servicesTitle?: string;
  servicesSubtitle?: string;
  homeSectionsOrder?: string[]; 
  navigationItems?: { id: string; label: string; url: string; order: number }[];
  socialLinks?: { id: string; platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook'; url: string }[];
  contactInfo?: { email: string; phone: string; address: string };
  fontTitle?: 'Prata' | 'Montserrat' | 'Inter' | 'Playfair Display' | 'Lora';
  fontBody?: 'Montserrat' | 'Inter' | 'Open Sans' | 'Lora';
  themeMood?: 'calm' | 'professional' | 'warm';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  layout?: any;
  updatedAt?: any;
  propertiesPerPage?: number;
  chatbotEnabled?: boolean;
  chatbotPersona?: string;
  chatbotPricing?: {
    consultation: number;
    hourly_rate: number;
    sliding_scale: boolean;
  };
}

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  description?: string; // SEO meta
  showInNav: boolean;
  order: number;
  layout?: any;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  url?: string;
  order: number;
}

interface SiteContentContextType {
  settings: SiteSettings;
  pages: CustomPage[];
  services: ServiceItem[];
  portfolioItems: any[];
  loading: boolean;
  isAdmin: boolean;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  isLight: boolean;
  setIsLight: (val: boolean) => void;
}

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'Therapy With Edward',
  logoText: 'TWE',
  logoLight: '',
  logoDark: '',
  tagline: 'Pathways to Clarity and Connection',
  heroTitlePart1: 'Mindful',
  heroTitlePart2: 'Therapeutic',
  heroTitleAccent: 'Practice',
  heroImage: 'https://images.unsplash.com/photo-1527137341206-6448377c860e?auto=format&fit=crop&q=80&w=1200',
  heroAlignment: 'center',
  primaryColor: '#2D4236',   // Forest Canopy
  secondaryColor: '#7A827E', // River Stone
  accentColor: '#B06C4D',    // Terracotta Path
  backgroundColor: '#F9F7F2', // Soft Linen
  textColor: '#1A1A1A',       // Evening Slate
  borderColor: 'rgba(122, 130, 126, 0.2)', // River Stone with opacity
  glassColor: 'rgba(249, 247, 242, 0.9)',  // Soft Linen with opacity
  footerQuote: 'Your mental well-being is the foundation of a meaningful life.',
  inquiryTitle: 'Start Your Journey',
  servicesTitle: 'Therapeutic Services',
  servicesSubtitle: 'Specialized care designed to support your growth, healing, and emotional resilience.',
  homeSectionsOrder: ['services', 'portfolio'],
  navigationItems: [],
  socialLinks: [
    { id: '1', platform: 'linkedin', url: 'https://linkedin.com' }
  ],
  contactInfo: {
    email: 'edward@therapywithedward.com',
    phone: '+1 (555) 012-3456',
    address: '456 Wellness Plaza, Suite 200'
  },
  fontTitle: 'Playfair Display',
  fontBody: 'Inter',
  themeMood: 'calm',
  borderRadius: 'md',
  propertiesPerPage: 6,
  chatbotEnabled: true,
  chatbotPersona: 'You are the practice assistant for Edward, a psychotherapist. You are compassionate, professional, and calm. You help visitors understand the therapeutic approach, services (Individual Therapy, CBT, Couples Counseling), and how to book a consultation. Do not provide medical advice.',
  chatbotPricing: {
    consultation: 0,
    hourly_rate: 180,
    sliding_scale: true
  }
};

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLight, setIsLight] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'light' || localStorage.getItem('theme') === null; // Default to light for this therapy app? Actually checking the theme logic elsewhere.
    }
    return false;
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  useEffect(() => {
    let currentIsAdmin = false;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        if (ADMIN_EMAILS.includes(user.email)) {
          setIsAdmin(true);
          currentIsAdmin = true;
          return;
        }

        // Also check Firestore admins collection
        const adminDoc = await getDoc(doc(db, 'admins', user.email));
        const isAdminUser = adminDoc.exists();
        setIsAdmin(isAdminUser);
        currentIsAdmin = isAdminUser;
      } else {
        setIsAdmin(false);
        currentIsAdmin = false;
      }
    });

    const settingsRef = doc(db, 'settings', 'site');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...docSnap.data() } as SiteSettings);
      } else if (currentIsAdmin) {
        // Only attempt initialization if the user has admin rights
        setDoc(settingsRef, {
          ...DEFAULT_SETTINGS,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/site'));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/site'));

    const qPages = query(collection(db, 'pages'), orderBy('order', 'asc'));
    const unsubPages = onSnapshot(qPages, (snap) => {
      setPages(snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomPage)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'pages');
    });

    const qServices = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsubServices = onSnapshot(qServices, (snap) => {
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceItem)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'services');
    });

    const qPortfolio = query(collection(db, 'portfolio_items'), orderBy('order', 'asc'));
    const unsubPortfolio = onSnapshot(qPortfolio, (snap) => {
      setPortfolioItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'portfolio_items');
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubSettings();
      unsubPages();
      unsubServices();
      unsubPortfolio();
    };
  }, []);

  return (
    <SiteContentContext.Provider value={{ 
      settings, 
      pages, 
      services, 
      portfolioItems, 
      loading, 
      isAdmin, 
      isEditMode, 
      setIsEditMode,
      isLight,
      setIsLight
    }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) throw new Error('useSiteContent must be used within SiteContentProvider');
  return context;
};
