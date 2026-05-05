/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Config, DropZone } from "@measured/puck";
import { Helmet } from "react-helmet-async";
import { MessageSquare, MoveUpRight, CloudMoon, CloudSun, ChevronDown, Check, X, Star, Zap, Shield, Target, Award, Users, Heart, Camera, Film, Layout, Type, Layers, Box, Maximize, MousePointer2 } from "lucide-react";
import { HeroVisual, BrandHeader } from "../components/Hero";
import { Portfolio, Services } from "../components/PortfolioSections";
import { BookingForm, FooterContent } from "../components/BookingAndFooter";
import { TestimonialCarousel } from "../components/TestimonialCarousel";
import { PropertyHighlight, TourEmbed } from "../components/PropertyFeatures";
import { LogoCloud, InstagramFeed } from "../components/SocialNodes";
import { ChatWidget } from "../components/ChatWidget";
import { LinkButton } from "../components/LinkButton";
import { useSiteContent } from "./SiteContentContext";
import { CustomPaddingField, CustomColorField, ConstrainedTypographyField } from "./PuckCustomFields";
import { FirebaseImageField } from "./FirebaseImageField";
import { motion, AnimatePresence } from "motion/react";

const IconMap = {
  MessageSquare, MoveUpRight, CloudMoon, CloudSun, ChevronDown, Check, X, Star, Zap, Shield, Target, Award, Users, Heart, Camera, Film, Layout, Type, Layers, Box, Maximize, MousePointer2
};

const InlineHTML = ({ html, height }: { html: string, height?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear and set HTML content
    containerRef.current.innerHTML = html;
    
    // Find all scripts inside the injected HTML
    const scripts = Array.from(containerRef.current.querySelectorAll('script'));
    
    if (scripts.length === 0) return;

    // Helper to load scripts sequentially
    const loadScript = (index: number) => {
      if (index >= scripts.length) return;
      
      const oldScript = scripts[index];
      const newScript = document.createElement('script');
      
      // Copy attributes
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Handle inline vs external scripts
      if (oldScript.src) {
        newScript.onload = () => loadScript(index + 1);
        newScript.onerror = () => loadScript(index + 1);
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      } else {
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
        loadScript(index + 1);
      }
    };

    loadScript(0);
  }, [html]);

  return (
    <div 
      ref={containerRef}
      className="w-full overflow-hidden" 
      style={height ? { height: `${height}px`, overflowY: 'auto' } : {}}
    />
  );
};

export type RootProps = {
  title: string;
  description?: string;
  ogImage?: string;
  primaryThemeColor: string;
  typographyPairing: "classic" | "modern" | "editorial" | "minimalist";
};

export type PuckConfigProps = {
  Section: {
    paddingTop: number;
    paddingBottom: number;
    paddingX: number;
    background: "primary" | "secondary" | "accent" | "custom" | "image";
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundOverlay?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    shadow?: "none" | "sm" | "md" | "lg" | "xl";
    children?: React.ReactNode;
  };
  FlexContainer: {
    direction: "row" | "column";
    gap: number;
    justify: "start" | "center" | "end" | "between";
    align: "start" | "center" | "end" | "stretch";
    padding: number;
    wrap: boolean;
  };
  Columns: {
    leftColumnWidth: number;
    gap: number;
    left?: React.ReactNode;
    right?: React.ReactNode;
  };
  Typography: {
    text: string;
    tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
    size: number;
    weight: "300" | "400" | "500" | "600" | "700" | "800";
    align: "left" | "center" | "right" | "justify";
    color: "primary" | "secondary" | "accent" | "custom";
    customColor?: string;
    italic: boolean;
    uppercase: boolean;
    letterSpacing: number;
    lineHeight: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    marginTop?: number;
    marginBottom?: number;
    maxWidth?: number;
  };
  Heading: {
    text: string;
    level: 1 | 2 | 3 | 4;
    align: "left" | "center" | "right";
    accent: boolean;
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  };
  RichText: {
    content: string;
    size: "sm" | "base" | "lg";
    align: "left" | "center" | "right";
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  };
  Hero: {
    imageUrl?: string;
    height: "short" | "medium" | "tall";
    width: "full" | "half";
    align: "left" | "center" | "right";
    cta: {
      type: "internal" | "external";
      url: string;
      label: string;
    };
  };
  TextContent: {
    title1: string;
    title2: string;
    accent: string;
    tagline: string;
    width: "full" | "half";
  };
  Portfolio: {
    variant: "grid" | "gallery";
    panel?: "main" | "side";
    limit?: number;
    showFilter: boolean;
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
  };
  Services: {
    mode: "auto" | "manual";
    title: string;
    subtitle: string;
    items?: {
      title: string;
      price: string;
      description: string;
      url: string;
    }[];
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
  };
  Accordion: {
    items: {
      title: string;
      content: string;
    }[];
    allowMultiple: boolean;
  };
  PricingTable: {
    plans: {
      name: string;
      price: string;
      period: string;
      features: string[];
      buttonLabel: string;
      buttonUrl: string;
      isFeatured: boolean;
    }[];
  };
  IconBox: {
    icon: keyof typeof IconMap;
    title: string;
    description: string;
    iconPosition: "top" | "left";
    iconSize: number;
    iconColor: string;
    align: "left" | "center" | "right";
  };
  Contact: {
    title: string;
    description?: string;
    buttonLabel?: string;
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
  };
  Footer: {
    quote: string;
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
  };
  Spacer: {
    size: number;
    width: "full" | "half";
    line?: boolean;
    lineColor?: string;
  };
  Testimonials: {
    maxItems: number;
    width: "full" | "half";
  };
  MediaEmbed: {
    url: string;
    mediaType: "image" | "video";
    widthPercentage: number;
    aspectRatio: "16/9" | "4/3" | "1/1" | "9/16";
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
  };
  PropertyHighlight: {
    mediaUrl: string;
    mediaType: "image" | "video";
    daysOnMarket: number;
    salePrice: string;
    listPrice: string;
    packageUsed: string;
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
  };
  TourEmbed: {
    url: string;
    height: number;
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
  };
  LogoCloud: {
    logos: { url: string; alt: string }[];
    width: "full" | "half";
  };
  InstagramFeed: {
    username: string;
    width: "full" | "half";
  };
  ChatWidget: {
    enabled: boolean;
    persona?: string;
    consultationPrice?: string;
    hourlyRate?: string;
    width: "full" | "half";
  };
  HTMLEmbed: {
    html: string;
    height?: number;
    title?: string;
    wrapInIframe?: boolean;
    width: "full" | "half";
  };
  Button: {
    link: {
      type: "internal" | "external";
      url: string;
      label: string;
    };
    align: "left" | "center" | "right";
    width: "full" | "half";
    paddingTop?: number;
    paddingBottom?: number;
  };
  FeatureSection: {
    imageSide: "left" | "right";
    imageUrl: string;
    title: string;
    description: string;
    backgroundColor: string;
    paddingTop?: number;
    paddingBottom?: number;
  };
};

export type PuckConfig = Config<PuckConfigProps, RootProps>;

export const createConfig = (pages: any[] = []): PuckConfig => {
  const pageOptions = pages.map(p => ({ label: p.title || p.slug, value: p.slug }));
  
  const LinkField = {
    type: "custom" as const,
    render: ({ name, value, onChange }: any) => {
      const val = value || { type: 'internal', label: '', url: '' };
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onChange({ ...val, type: "internal" })}
              className={`flex-1 py-1 text-xs border ${val.type === "internal" ? "bg-brick-copper border-brick-copper text-charcoal font-bold" : "bg-transparent border-gray-600 text-gray-300"}`}
            >Internal</button>
            <button
              onClick={() => onChange({ ...val, type: "external" })}
              className={`flex-1 py-1 text-xs border ${val.type === "external" ? "bg-brick-copper border-brick-copper text-charcoal font-bold" : "bg-transparent border-gray-600 text-gray-300"}`}
            >External</button>
          </div>
          <input
            className="w-full bg-[#202020] border-none p-2 text-xs text-white"
            placeholder="Button Label"
            value={val.label || ""}
            onChange={(e) => onChange({ ...val, label: e.target.value })}
          />
          {val.type === "internal" ? (
            <select
              className="w-full bg-[#202020] border-none p-2 text-xs text-white"
              value={val.url || ""}
              onChange={(e) => onChange({ ...val, url: e.target.value })}
            >
              <option value="">Select a page...</option>
              <option value="/">Home</option>
              {pageOptions.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          ) : (
            <input
              className="w-full bg-[#202020] border-none p-2 text-xs text-white"
              placeholder="https://"
              value={val.url || ""}
              onChange={(e) => onChange({ ...val, url: e.target.value })}
            />
          )}
        </div>
      );
    }
  };
  
  const WidthField = {
    type: "radio" as const,
    options: [
      { label: "Full Width", value: "full" },
      { label: "Half Width", value: "half" }
    ]
  };

  const PaddingField = CustomPaddingField;

  const ComponentWrapper = ({ width, children }: { width?: "full" | "half", children: React.ReactNode }) => {
    return (
      <div className={`${width === 'half' ? 'w-full lg:w-1/2' : 'w-full'}`}>
        {children}
      </div>
    );
  };
  
  return {
    root: {
      fields: {
        title: { type: "text" },
        description: { type: "textarea" },
        ogImage: FirebaseImageField as any,
        primaryThemeColor: CustomColorField as any,
        typographyPairing: ConstrainedTypographyField as any,
      },
      defaultProps: {
        title: "Home",
        description: "Professional architectural narratives and therapeutic spaces.",
        primaryThemeColor: "#2D4236",
        typographyPairing: "classic"
      },
      render: ({ children, title, description, ogImage, primaryThemeColor, typographyPairing }: any) => {
        const { isLight, setIsLight, settings } = useSiteContent();
        
        // Use page-level meta, fallback to site settings
        const pageTitle = `${title} | ${settings.brandName || 'Therapy With Edward'}`;
        const pageDesc = description || settings.tagline;
        const pageOgImage = ogImage || settings.heroImage;
        
        let fontDisplay = "Playfair Display, serif";
        let fontBody = "Inter, sans-serif";
        if (typographyPairing === "modern") {
          fontDisplay = "Montserrat, sans-serif";
          fontBody = "Open Sans, sans-serif";
        } else if (typographyPairing === "editorial") {
          fontDisplay = "Prata, serif";
          fontBody = "Lora, serif";
        } else if (typographyPairing === "minimalist") {
          fontDisplay = "Inter, sans-serif";
          fontBody = "Inter, sans-serif";
        }

        const customStyle: React.CSSProperties = {
          '--color-primary': primaryThemeColor,
          '--color-accent': primaryThemeColor,
          '--font-display-custom': fontDisplay,
          '--font-body-custom': fontBody,
        } as React.CSSProperties;

        return (
          <div className="flex flex-col lg:flex-row min-h-screen items-stretch bg-bg-primary overflow-x-hidden" style={customStyle}>
            {/* RESPONSIVE SIDEBAR */}
            <aside className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border-subtle flex flex-col bg-bg-primary sticky lg:sticky top-0 z-40 h-auto lg:h-screen overflow-y-auto no-scrollbar">

              <div className="flex flex-col p-6 pt-24 lg:p-12 lg:pt-12 xl:p-16 w-full">
                <div className="flex flex-col gap-y-4 lg:gap-y-8">
                  <DropZone zone="side" />
                </div>
                
                <div className="hidden lg:flex mt-auto pt-12 items-center gap-6">
                  <button 
                    onClick={() => setIsLight(!isLight)}
                    className="text-text-primary/40 hover:text-brick-copper transition-colors p-2 hover:bg-white/5 rounded-full"
                  >
                    {isLight ? <CloudMoon size={18} /> : <CloudSun size={18} />}
                  </button>
                  <span className="text-[9px] uppercase tracking-widest text-text-primary/20">Site Narrative Engine</span>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 relative flex flex-col min-h-screen">
              {children}
            </main>
          </div>
        );
      }
    },
    components: {
      Typography: {
        fields: {
          text: { type: "text", contentEditable: true },
          tag: {
            type: "select",
            options: [
              { label: "H1", value: "h1" },
              { label: "H2", value: "h2" },
              { label: "H3", value: "h3" },
              { label: "H4", value: "h4" },
              { label: "H5", value: "h5" },
              { label: "H6", value: "h6" },
              { label: "Paragraph", value: "p" },
              { label: "Span", value: "span" },
              { label: "Div", value: "div" },
            ]
          },
          size: { type: "number" },
          weight: {
            type: "select",
            options: [
              { label: "300 - Light", value: "300" },
              { label: "400 - Regular", value: "400" },
              { label: "500 - Medium", value: "500" },
              { label: "600 - SemiBold", value: "600" },
              { label: "700 - Bold", value: "700" },
              { label: "800 - ExtraBold", value: "800" },
            ]
          },
          align: {
            type: "radio",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
              { label: "Justify", value: "justify" },
            ]
          },
          color: {
            type: "select",
            options: [
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Accent", value: "accent" },
              { label: "Custom", value: "custom" },
            ]
          },
          customColor: CustomColorField as any,
          italic: { type: "radio", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
          uppercase: { type: "radio", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
          letterSpacing: { type: "number" },
          lineHeight: { type: "number" },
          paddingTop: PaddingField as any,
          paddingBottom: PaddingField as any,
          paddingLeft: PaddingField as any,
          paddingRight: PaddingField as any,
          marginTop: PaddingField as any,
          marginBottom: PaddingField as any,
          maxWidth: { type: "number" },
        },
        defaultProps: {
          text: "Typography text goes here",
          tag: "p",
          size: 16,
          weight: "400",
          align: "left",
          color: "primary",
          italic: false,
          uppercase: false,
          letterSpacing: 0,
          lineHeight: 1.5,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginTop: 0,
          marginBottom: 16,
        },
        render: (props) => {
          const { 
            text, tag: Tag = "p", size, weight, align, color, customColor, 
            italic, uppercase, letterSpacing, lineHeight, 
            paddingTop, paddingBottom, paddingLeft, paddingRight,
            marginTop, marginBottom, maxWidth 
          } = props;

          const colorMap = {
            primary: "var(--text-primary)",
            secondary: "var(--text-primary)/60",
            accent: "var(--color-accent)",
            custom: customColor
          };

          const style: React.CSSProperties = {
            fontSize: `${size}px`,
            fontWeight: weight,
            textAlign: align as any,
            color: color === 'custom' ? customColor : (color === 'accent' ? 'var(--color-accent)' : (color === 'secondary' ? 'rgba(0,0,0,0.6)' : 'var(--text-primary)')),
            fontStyle: italic ? 'italic' : 'normal',
            textTransform: uppercase ? 'uppercase' : 'none',
            letterSpacing: `${letterSpacing}px`,
            lineHeight: lineHeight,
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
            paddingLeft: `${paddingLeft}px`,
            paddingRight: `${paddingRight}px`,
            marginTop: `${marginTop}px`,
            marginBottom: `${marginBottom}px`,
            maxWidth: maxWidth ? `${maxWidth}px` : 'none',
          };

          return <Tag style={style}>{text}</Tag>;
        }
      },
      FlexContainer: {
        fields: {
          direction: {
            type: "radio",
            options: [
              { label: "Row", value: "row" },
              { label: "Column", value: "column" },
            ]
          },
          gap: { type: "number" },
          justify: {
            type: "select",
            options: [
              { label: "Start", value: "start" },
              { label: "Center", value: "center" },
              { label: "End", value: "end" },
              { label: "Space Between", value: "between" },
            ]
          },
          align: {
            type: "select",
            options: [
              { label: "Start", value: "start" },
              { label: "Center", value: "center" },
              { label: "End", value: "end" },
              { label: "Stretch", value: "stretch" },
            ]
          },
          padding: PaddingField as any,
          wrap: { type: "radio", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
        },
        defaultProps: {
          direction: "column",
          gap: 16,
          justify: "start",
          align: "stretch",
          padding: 0,
          wrap: false,
        },
        render: ({ direction, gap, justify, align, padding, wrap }) => {
          const justifyClass = {
            start: "justify-start",
            center: "justify-center",
            end: "justify-end",
            between: "justify-between",
          }[justify];

          const alignClass = {
            start: "items-start",
            center: "items-center",
            end: "items-end",
            stretch: "items-stretch",
          }[align];

          return (
            <div 
              className={`flex ${direction === 'row' ? 'flex-row' : 'flex-col'} ${justifyClass} ${alignClass} ${wrap ? 'flex-wrap' : 'flex-nowrap'}`}
              style={{ gap: `${gap}px`, padding: `${padding}px` }}
            >
              <DropZone zone="children" />
            </div>
          );
        }
      },
      Accordion: {
        fields: {
          allowMultiple: { type: "radio", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
          items: {
            type: "array",
            arrayFields: {
              title: { type: "text", contentEditable: true },
              content: { type: "textarea", contentEditable: true },
            }
          }
        },
        defaultProps: {
          allowMultiple: false,
          items: [
            { title: "What services do you offer?", content: "We offer high-fidelity architectural narratives and therapeutic spaces for growth." },
            { title: "How can I start a project?", content: "You can use our inquiry form to reach out and schedule a consultation." }
          ]
        },
        render: ({ items, allowMultiple }) => {
          const [openIndices, setOpenIndices] = useState<number[]>([]);

          const toggle = (idx: number) => {
            if (openIndices.includes(idx)) {
              setOpenIndices(openIndices.filter(i => i !== idx));
            } else {
              setOpenIndices(allowMultiple ? [...openIndices, idx] : [idx]);
            }
          };

          return (
            <div className="space-y-4 w-full">
              {items.map((item, idx) => (
                <div key={idx} className="border-b border-border-subtle overflow-hidden">
                  <button 
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <span className="font-display italic text-lg lg:text-xl group-hover:text-brick-copper transition-colors">{item.title}</span>
                    <motion.div
                      animate={{ rotate: openIndices.includes(idx) ? 180 : 0 }}
                      className="text-text-primary/30"
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openIndices.includes(idx) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-8 text-sm text-text-primary/60 max-w-2xl leading-relaxed whitespace-pre-wrap">
                          {item.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          );
        }
      },
      PricingTable: {
        fields: {
          plans: {
            type: "array",
            arrayFields: {
              name: { type: "text" },
              price: { type: "text" },
              period: { type: "text" },
              features: { type: "array", arrayFields: { item: { type: "text" } } as any },
              buttonLabel: { type: "text" },
              buttonUrl: { type: "text" },
              isFeatured: { type: "radio", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
            }
          }
        },
        defaultProps: {
          plans: [
            { 
              name: "Standard", price: "$150", period: "/session", 
              features: ["Individual Consultation", "Resource Access", "Email Support"],
              buttonLabel: "Get Started", buttonUrl: "/inquiry", isFeatured: false
            },
            { 
              name: "Premium", price: "$250", period: "/session", 
              features: ["Priority Scheduling", "Advanced Narrative Tools", "Personalized Roadmap", "Chat Support"],
              buttonLabel: "Get Started", buttonUrl: "/inquiry", isFeatured: true
            }
          ]
        },
        render: ({ plans }) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`p-8 border flex flex-col transition-all duration-500 ${plan.isFeatured ? "border-brick-copper bg-text-primary/[0.03] scale-105 z-10" : "border-border-subtle"}`}
              >
                <div className="mb-8">
                  <h3 className="text-[10px] uppercase tracking-widest text-text-primary/40 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display italic tracking-tight">{plan.price}</span>
                    <span className="text-xs text-text-primary/40">{plan.period}</span>
                  </div>
                </div>
                <div className="space-y-4 mb-10 flex-1">
                  {(plan.features as any).map((feature: any, fIdx: number) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="mt-1 text-brick-copper"><Check size={14} /></div>
                      <span className="text-xs text-text-primary/60">{feature.item || feature}</span>
                    </div>
                  ))}
                </div>
                <Link 
                  to={plan.buttonUrl} 
                  className={`w-full py-4 text-center text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${plan.isFeatured ? "bg-brick-copper text-charcoal hover:bg-white hover:text-charcoal" : "border border-border-subtle hover:border-brick-copper"}`}
                >
                  {plan.buttonLabel}
                </Link>
              </div>
            ))}
          </div>
        )
      },
      IconBox: {
        fields: {
          icon: {
            type: "select",
            options: Object.keys(IconMap).map(k => ({ label: k, value: k }))
          },
          title: { type: "text", contentEditable: true },
          description: { type: "textarea", contentEditable: true },
          iconPosition: { type: "radio", options: [{ label: "Top", value: "top" }, { label: "Left", value: "left" }] },
          iconSize: { type: "number" },
          iconColor: CustomColorField as any,
          align: {
            type: "radio",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]
          }
        },
        defaultProps: {
          icon: "Shield",
          title: "Architecture of Mind",
          description: "Nurturing spaces through thoughtful design.",
          iconPosition: "top",
          iconSize: 32,
          iconColor: "#B85C38",
          align: "left",
        },
        render: ({ icon, title, description, iconPosition, iconSize, iconColor, align }) => {
          const IconComp = IconMap[icon] || Shield;
          const alignClass = { left: "text-left items-start", center: "text-center items-center", right: "text-right items-end" }[align];
          
          if (iconPosition === 'top') {
            return (
              <div className={`flex flex-col ${alignClass} gap-4 p-4`}>
                <div style={{ color: iconColor }}><IconComp size={iconSize} /></div>
                <div>
                  <h3 className="font-display italic text-2xl mb-2">{title}</h3>
                  <p className="text-sm text-text-primary/60 leading-relaxed">{description}</p>
                </div>
              </div>
            );
          }

          return (
            <div className={`flex gap-6 p-4 ${align === 'right' ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div className="shrink-0" style={{ color: iconColor }}><IconComp size={iconSize} /></div>
              <div>
                <h3 className="font-display italic text-2xl mb-2">{title}</h3>
                <p className="text-sm text-text-primary/60 leading-relaxed">{description}</p>
              </div>
            </div>
          );
        }
      },
      Button: {
        fields: {
          link: LinkField as any,
          align: {
            type: "radio",
            options: [
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]
          },
          width: WidthField as any,
          paddingTop: PaddingField as any,
          paddingBottom: PaddingField as any,
        },
        defaultProps: {
          link: {
            type: "internal",
            label: "Learn More",
            url: "about"
          },
          align: "left",
          width: "full",
          paddingTop: 16,
          paddingBottom: 16,
        },
        render: ({ link, align, width, paddingTop, paddingBottom }) => {
          const justify = align === 'center' ? 'center' : align === 'right' ? 'end' : 'start';
          const pt = paddingTop ?? 16;
          const pb = paddingBottom ?? 16;
          return (
            <ComponentWrapper width={width}>
              <div className={`flex justify-${justify}`} style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px` }}>
                <LinkButton link={link} />
              </div>
            </ComponentWrapper>
          );
        }
      },
      Section: {
        fields: {
          paddingTop: PaddingField as any,
          paddingBottom: PaddingField as any,
          paddingX: PaddingField as any,
          background: {
            type: "select",
            options: [
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Accent", value: "accent" },
              { label: "Custom Color", value: "custom" },
              { label: "Image", value: "image" },
            ],
          },
          backgroundColor: CustomColorField as any,
          backgroundImage: FirebaseImageField as any,
          backgroundOverlay: { type: "number", min: 0, max: 1 },
          borderRadius: { type: "number" },
          borderWidth: { type: "number" },
          borderColor: CustomColorField as any,
          shadow: {
            type: "select",
            options: [
              { label: "None", value: "none" },
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra Large", value: "xl" },
            ]
          }
        },
        defaultProps: {
          paddingTop: 80,
          paddingBottom: 80,
          paddingX: 16,
          background: "primary",
          backgroundOverlay: 0,
          borderRadius: 0,
          borderWidth: 0,
          shadow: "none",
        },
        render: ({ paddingTop, paddingBottom, paddingX, background = "primary", backgroundColor, backgroundImage, backgroundOverlay, borderRadius, borderWidth, borderColor, shadow }) => {
          const bgClass = {
            primary: "bg-bg-primary",
            secondary: "bg-bg-secondary",
            accent: "bg-charcoal text-white",
            custom: "",
            image: "relative overflow-hidden"
          }[background] || "bg-bg-primary";

          const shadowClass = {
            none: "",
            sm: "shadow-sm",
            md: "shadow-md",
            lg: "shadow-lg",
            xl: "shadow-xl"
          }[shadow || "none"];

          const style: React.CSSProperties = { 
            paddingTop: `${paddingTop}px`, 
            paddingBottom: `${paddingBottom}px`,
            paddingLeft: `${paddingX}px`,
            paddingRight: `${paddingX}px`,
            borderRadius: `${borderRadius}px`,
            borderWidth: `${borderWidth}px`,
            borderColor: borderColor,
            borderStyle: borderWidth ? 'solid' : 'none'
          };

          if (background === 'custom' && backgroundColor) style.backgroundColor = backgroundColor;
          if (background === 'image' && backgroundImage) {
            style.backgroundImage = `url(${backgroundImage})`;
            style.backgroundSize = 'cover';
            style.backgroundPosition = 'center';
          }

          return (
            <section className={`${bgClass} ${shadowClass} transition-all duration-300`} style={style}>
              {background === 'image' && backgroundOverlay && (
                <div className="absolute inset-0 bg-charcoal/60" style={{ opacity: backgroundOverlay }} />
              )}
              <div className="max-w-7xl mx-auto relative z-10"><DropZone zone="children" /></div>
            </section>
          );
        },
      },
    Columns: {
      fields: {
        leftColumnWidth: {
          type: "number",
          min: 10,
          max: 90,
        },
        gap: { type: "number" },
      },
      defaultProps: {
        leftColumnWidth: 50,
        gap: 32,
      },
      render: ({ leftColumnWidth, gap }) => {
        return (
          <div className="flex flex-col md:grid" style={{ gap: `${gap}px`, gridTemplateColumns: `${leftColumnWidth}% ${100 - leftColumnWidth}%` }}>
            <div className="w-full"><DropZone zone="left" /></div>
            <div className="w-full"><DropZone zone="right" /></div>
          </div>
        );
      },
    },
    Heading: {
      fields: {
        text: { type: "text", contentEditable: true },
        level: {
          type: "select",
          options: [
            { label: "Heading 1", value: 1 },
            { label: "Heading 2", value: 2 },
            { label: "Heading 3", value: 3 },
            { label: "Heading 4", value: 4 },
          ],
        },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        accent: { 
          type: "radio",
          options: [
            { label: "Standard", value: false },
            { label: "Accent Color", value: true }
          ]
        },
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
        paddingLeft: PaddingField as any,
        paddingRight: PaddingField as any,
        width: WidthField as any,
      },
      defaultProps: {
        text: "Elevated Architecture",
        level: 2,
        align: "left",
        accent: false,
        paddingTop: 32,
        paddingBottom: 32,
        paddingLeft: 32,
        paddingRight: 32,
        width: "full",
      },
      render: ({ text, level, align, accent, width, paddingTop, paddingBottom, paddingLeft, paddingRight }) => {
        const Tag = (level ? `h${level}` : "h2") as any;
        const alignClass = { left: "text-left", center: "text-center", right: "text-right" }[align];
        const sizeClass = {
          1: "text-5xl md:text-7xl",
          2: "text-4xl md:text-5xl",
          3: "text-2xl md:text-3xl",
          4: "text-xl md:text-2xl",
        }[level];
        
        const pt = paddingTop ?? 32;
        const pb = paddingBottom ?? 32;
        const pl = paddingLeft ?? 32;
        const pr = paddingRight ?? 32;

        return (
          <ComponentWrapper width={width}>
            <div style={{ 
              paddingTop: `${pt}px`, 
              paddingBottom: `${pb}px`, 
              paddingLeft: `${pl}px`, 
              paddingRight: `${pr}px` 
            }}>
              <Tag className={`${alignClass} ${sizeClass} font-display italic tracking-tight ${accent ? "text-brick-copper" : "text-text-primary"}`}>
                {text}
              </Tag>
            </div>
          </ComponentWrapper>
        );
      },
    },
    RichText: {
      fields: {
        content: { type: "textarea", contentEditable: true },
        size: {
          type: "select",
          options: [
            { label: "Small", value: "sm" },
            { label: "Base", value: "base" },
            { label: "Large", value: "lg" },
          ],
        },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
        paddingLeft: PaddingField as any,
        paddingRight: PaddingField as any,
        width: WidthField as any,
      },
      defaultProps: {
        content: "High-fidelity narratives for architectural excellence.",
        size: "base",
        align: "left",
        paddingTop: 32,
        paddingBottom: 32,
        paddingLeft: 32,
        paddingRight: 32,
        width: "full",
      },
      render: ({ content, size, align, width, paddingTop, paddingBottom, paddingLeft, paddingRight }) => {
        const sizeClass = { sm: "text-xs", base: "text-sm", lg: "text-base" }[size];
        const alignClass = { left: "text-left", center: "text-center", right: "text-right" }[align || "left"];
        
        const pt = paddingTop ?? 32;
        const pb = paddingBottom ?? 32;
        const pl = paddingLeft ?? 32;
        const pr = paddingRight ?? 32;

        return (
          <ComponentWrapper width={width}>
            <div 
              style={{ 
                paddingTop: `${pt}px`, 
                paddingBottom: `${pb}px`, 
                paddingLeft: `${pl}px`, 
                paddingRight: `${pr}px` 
              }}
              className={`${sizeClass} ${alignClass} leading-relaxed text-text-primary/60 max-w-2xl mx-auto`}
            >
              {content}
            </div>
          </ComponentWrapper>
        );
      },
    },
    Hero: {
      fields: {
        imageUrl: FirebaseImageField as any,
        height: {
          type: "select",
          options: [
            { label: "Short", value: "short" },
            { label: "Medium", value: "medium" },
            { label: "Tall", value: "tall" },
          ],
        },
        align: {
          type: "radio",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        cta: LinkField as any,
        width: WidthField as any,
      },
      defaultProps: {
        height: "short",
        width: "full",
        align: "center",
        cta: {
          type: "internal",
          label: "View Portfolio",
          url: "portfolio"
        }
      },
      render: ({ imageUrl, cta, width, align }) => {
        const justify = align === 'center' ? 'center' : align === 'right' ? 'end' : 'start';
        return (
          <ComponentWrapper width={width}>
            <div className="relative">
              <HeroVisual 
                imageUrl={imageUrl} 
                showCta={false} 
              />
              {cta?.label && (
                <div className={`absolute inset-0 flex items-center justify-${justify} px-16 pointer-events-none mt-24`}>
                  <div className="pointer-events-auto">
                    <LinkButton link={cta} />
                  </div>
                </div>
              )}
            </div>
          </ComponentWrapper>
        );
      },
    },
    TextContent: {
      fields: {
        title1: { type: "text", contentEditable: true },
        title2: { type: "text", contentEditable: true },
        accent: { type: "text" },
        tagline: { type: "text", contentEditable: true },
        width: WidthField as any,
      },
      defaultProps: {
        title1: "EXPOSED",
        title2: "BRICK",
        accent: "MEDIA",
        tagline: "HIGH-FIDELITY ARCHITECTURAL NARRATIVES",
        width: "full",
      },
      render: ({ title1, title2, accent, tagline, width }) => (
        <ComponentWrapper width={width}>
          <BrandHeader override={{ title1, title2, accent, tagline }} />
        </ComponentWrapper>
      ),
    },
    Portfolio: {
      fields: {
        variant: {
          type: "select",
          options: [
            { label: "Classic Grid", value: "grid" },
            { label: "Gallery Masonry", value: "gallery" }
          ]
        },
        panel: {
          type: "select",
          options: [
            { label: "Main Panel Items", value: "main" },
            { label: "Side Panel Items", value: "side" }
          ]
        },
        limit: { type: "number" },
        showFilter: { 
          type: "radio",
          options: [
            { label: "Show", value: true },
            { label: "Hide", value: false }
          ]
        },
        width: WidthField as any,
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
      },
      defaultProps: {
        variant: "grid",
        panel: "main",
        showFilter: true,
        width: "full",
        paddingTop: 32,
        paddingBottom: 32,
      },
      render: ({ variant, panel, width, paddingTop, paddingBottom }) => (
        <ComponentWrapper width={width}>
          <div style={{ paddingTop: `${paddingTop ?? 32}px`, paddingBottom: `${paddingBottom ?? 32}px` }}>
            <Portfolio variant={variant} panel={panel as any} />
          </div>
        </ComponentWrapper>
      ),
    },
    Services: {
      fields: {
        mode: {
          type: "radio",
          options: [
            { label: "Auto (Data)", value: "auto" },
            { label: "Manual (Custom)", value: "manual" },
          ],
        },
        title: { type: "text", contentEditable: true },
        subtitle: { type: "text", contentEditable: true },
        items: {
          type: "array",
          arrayFields: {
            title: { type: "text", contentEditable: true },
            price: { type: "text" },
            description: { type: "textarea", contentEditable: true },
            url: { type: "text" },
          },
        },
        width: WidthField as any,
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
      },
      defaultProps: {
        mode: "auto",
        title: "SERVICES",
        subtitle: "Refined Solutions",
        width: "full",
        paddingTop: 32,
        paddingBottom: 32,
        items: [
          { title: "Photography", price: "$1,500", description: "Professional architectural coverage.", url: "" },
          { title: "Cinematography", price: "$2,500", description: "Narrative-driven video.", url: "" },
        ]
      },
      render: ({ mode, title, subtitle, items, width, paddingTop, paddingBottom }) => (
        <ComponentWrapper width={width}>
          <div style={{ paddingTop: `${paddingTop ?? 32}px`, paddingBottom: `${paddingBottom ?? 32}px` }}>
            <Services 
              override={{ title, subtitle }} 
              manualItems={mode === 'manual' ? items : undefined} 
            />
          </div>
        </ComponentWrapper>
      ),
    },
    Contact: {
      fields: {
        title: { type: "text", contentEditable: true },
        description: { type: "textarea", contentEditable: true },
        buttonLabel: { type: "text" },
        width: WidthField as any,
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
      },
      defaultProps: {
        title: "GET IN TOUCH",
        description: "Let's discuss your next project",
        buttonLabel: "Request Quote",
        width: "full",
        paddingTop: 32,
        paddingBottom: 32,
      },
      render: ({ title, description, buttonLabel, width, paddingTop, paddingBottom }) => (
        <ComponentWrapper width={width}>
          <div style={{ paddingTop: `${paddingTop ?? 32}px`, paddingBottom: `${paddingBottom ?? 32}px` }}>
            <BookingForm override={{ title, description, buttonLabel }} />
          </div>
        </ComponentWrapper>
      ),
    },
    Footer: {
      fields: {
        quote: { type: "text", contentEditable: true },
        width: WidthField as any,
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
      },
      defaultProps: {
        quote: "Elegance is the only beauty that never fades.",
        width: "full",
        paddingTop: 32,
        paddingBottom: 32,
      },
      render: ({ quote, width, paddingTop, paddingBottom }) => (
        <ComponentWrapper width={width}>
          <div style={{ paddingTop: `${paddingTop ?? 32}px`, paddingBottom: `${paddingBottom ?? 32}px` }}>
            <FooterContent override={{ quote }} />
          </div>
        </ComponentWrapper>
      ),
    },
    Spacer: {
      fields: {
        size: { 
          type: "number",
          min: 0,
          max: 200
        },
        width: WidthField as any,
        line: { 
          type: "radio", 
          options: [
            { label: "None", value: false },
            { label: "Separator Line", value: true }
          ] 
        },
        lineColor: { type: "text" }
      },
      defaultProps: {
        size: 40,
        width: "full",
        line: false,
        lineColor: "rgba(255,255,255,0.1)"
      },
      render: ({ size, width, line, lineColor }) => (
        <ComponentWrapper width={width}>
          <div className="flex flex-col justify-center" style={{ height: `${size}px` }}>
            {line && <div style={{ borderTop: `1px solid ${lineColor}` }} className="w-full" />}
          </div>
        </ComponentWrapper>
      ),
    },
    Testimonials: {
      fields: {
        maxItems: { type: "number" },
        width: WidthField as any,
      },
      defaultProps: { maxItems: 5, width: "full" },
      render: ({ maxItems, width }) => (
        <ComponentWrapper width={width}>
          <TestimonialCarousel maxItems={maxItems} />
        </ComponentWrapper>
      ),
    },
    PropertyHighlight: {
      fields: {
        mediaUrl: FirebaseImageField as any,
        mediaType: { 
          type: "select", 
          options: [{label: "Image", value: "image"}, {label: "Video", value: "video"}] 
        },
        daysOnMarket: { type: "number" },
        salePrice: { type: "text" },
        listPrice: { type: "text" },
        packageUsed: { type: "text" },
        width: WidthField as any,
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
      },
      defaultProps: {
        mediaUrl: "https://images.unsplash.com/photo-1600607687940-c52fb036999c",
        mediaType: "image",
        daysOnMarket: 14,
        salePrice: "$1,250,000",
        listPrice: "$1,150,000",
        packageUsed: "Cinematic Plus",
        width: "full",
        paddingTop: 32,
        paddingBottom: 32,
      },
      render: ({ mediaUrl, mediaType, daysOnMarket, salePrice, listPrice, packageUsed, width, paddingTop, paddingBottom }) => (
        <ComponentWrapper width={width}>
          <div style={{ paddingTop: `${paddingTop ?? 32}px`, paddingBottom: `${paddingBottom ?? 32}px` }}>
            <PropertyHighlight 
              mediaUrl={mediaUrl} 
              mediaType={mediaType} 
              daysOnMarket={daysOnMarket} 
              salePrice={salePrice} 
              listPrice={listPrice} 
              packageUsed={packageUsed} 
            />
          </div>
        </ComponentWrapper>
      ),
    },
    TourEmbed: {
      fields: {
        url: { type: "text" },
        height: { type: "number" },
        width: WidthField as any,
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
      },
      defaultProps: { 
        url: "", 
        height: 600, 
        width: "full",
        paddingTop: 32,
        paddingBottom: 32,
      },
      render: ({ url, height, width, paddingTop, paddingBottom }) => (
        <ComponentWrapper width={width}>
          <div style={{ paddingTop: `${paddingTop ?? 32}px`, paddingBottom: `${paddingBottom ?? 32}px` }}>
            <TourEmbed url={url} height={height} />
          </div>
        </ComponentWrapper>
      ),
    },
    LogoCloud: {
      fields: {
        logos: {
          type: "array",
          arrayFields: {
            url: FirebaseImageField as any,
            alt: { type: "text" },
          },
        },
        width: WidthField as any,
      },
      defaultProps: {
        width: "full",
        logos: [
          { url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Compass_logo.svg", alt: "Compass" },
          { url: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Sotheby%27s_International_Realty_logo.svg", alt: "Sotheby's" },
          { url: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Coldwell_Banker_logo.svg", alt: "Coldwell Banker" },
        ]
      },
      render: ({ logos, width }) => (
        <ComponentWrapper width={width}>
          <LogoCloud logos={logos} />
        </ComponentWrapper>
      ),
    },
    InstagramFeed: {
      fields: {
        username: { type: "text" },
        width: WidthField as any,
      },
      defaultProps: { username: "exposedbrickmedia", width: "full" },
      render: ({ username, width }) => (
        <ComponentWrapper width={width}>
          <InstagramFeed username={username} />
        </ComponentWrapper>
      ),
    },
    ChatWidget: {
      fields: {
        enabled: { type: "radio", options: [{label: "On", value: true}, {label: "Off", value: false}] },
        persona: { type: "textarea" },
        consultationPrice: { type: "text" },
        hourlyRate: { type: "text" },
        width: WidthField as any,
      },
      defaultProps: {
        enabled: true,
        width: "full"
      },
      render: ({ enabled, persona, consultationPrice, hourlyRate, width }) => (
        <ComponentWrapper width={width}>
          <div className="flex flex-col items-center p-8 bg-brick-copper/5 border border-brick-copper/20 rounded-lg">
             <MessageSquare className="text-brick-copper mb-4" size={32} />
             <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Chatbot Configuration</h4>
             <p className="text-[11px] text-text-primary/60 italic text-center">
               {enabled ? "Personalized AI Assistant is active on this page." : "Chatbot is disabled for this narrative space."}
             </p>
             {enabled && (
               <ChatWidget 
                 overrideSettings={{ 
                   chatbotEnabled: true, 
                   chatbotPersona: persona,
                   chatbotPricing: {
                     consultation: consultationPrice || "",
                     hourly_rate: hourlyRate || "",
                     sliding_scale: true
                   }
                 }} 
               />
             )}
          </div>
        </ComponentWrapper>
      )
    },
    MediaEmbed: {
      fields: {
        url: FirebaseImageField as any,
        mediaType: { 
          type: "select", 
          options: [{label: "Image", value: "image"}, {label: "Video", value: "video"}] 
        },
        widthPercentage: { type: "number", min: 10, max: 100 },
        aspectRatio: {
          type: "select",
          options: [
            { label: "16:9", value: "16/9" },
            { label: "4:3", value: "4/3" },
            { label: "1:1", value: "1/1" },
            { label: "9:16", value: "9/16" },
          ]
        },
        width: WidthField as any,
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
        borderRadius: { type: "number", min: 0, max: 100 },
        borderWidth: { type: "number", min: 0, max: 20 },
        borderColor: { type: "text" },
      },
      defaultProps: {
        url: "https://images.unsplash.com/photo-1600607687940-c52fb036999c",
        mediaType: "image",
        widthPercentage: 100,
        aspectRatio: "16/9",
        width: "full",
        paddingTop: 32,
        paddingBottom: 32,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
      },
      render: ({ url, mediaType, widthPercentage, aspectRatio, width, paddingTop, paddingBottom, borderRadius, borderWidth, borderColor }) => {
        const pt = paddingTop ?? 32;
        const pb = paddingBottom ?? 32;
        const br = borderRadius ?? 0;
        const bw = borderWidth ?? 1;
        const bc = borderColor ?? "rgba(255,255,255,0.1)";

        return (
          <ComponentWrapper width={width}>
            <div className="w-full flex justify-center" style={{ paddingTop: `${pt}px`, paddingBottom: `${pb}px` }}>
              <div 
                style={{ 
                  width: `${widthPercentage}%`, 
                  aspectRatio: aspectRatio,
                  borderRadius: `${br}px`,
                  borderWidth: `${bw}px`,
                  borderColor: bc
                }} 
                className="overflow-hidden bg-white/5 relative group border"
              >
                {mediaType === 'video' ? (
                  url ? <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover" /> : null
                ) : (
                  url ? <img src={url} className="w-full h-full object-cover" alt="" /> : null
                )}
              </div>
            </div>
          </ComponentWrapper>
        );
      }
    },
    HTMLEmbed: {
      fields: {
        html: { type: "textarea" },
        height: { type: "number" },
        title: { type: "text" },
        wrapInIframe: { 
          type: "radio",
          options: [
            { label: "Inline", value: false },
            { label: "Iframe (Isolated)", value: true }
          ]
        },
        width: WidthField as any,
      },
      defaultProps: {
        html: "<div style=\"padding: 20px; background: #eee; text-align: center;\">Custom HTML content</div>",
        wrapInIframe: false,
        title: "HTML Embed",
        width: "full"
      },
      render: ({ html, height, title, wrapInIframe, width }) => {
        const content = wrapInIframe ? (
          <iframe
            srcDoc={html}
            title={title}
            style={{ width: '100%', height: height ? `${height}px` : 'auto', border: 'none' }}
            sandbox="allow-scripts allow-top-navigation allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <InlineHTML html={html} height={height} />
        );

        return (
          <ComponentWrapper width={width}>
            {content}
          </ComponentWrapper>
        );
      }
    },
    FeatureSection: {
      fields: {
        imageSide: {
          type: "radio",
          options: [
            { label: "Image on Left", value: "left" },
            { label: "Image on Right", value: "right" }
          ]
        },
        imageUrl: FirebaseImageField as any,
        title: { type: "text", contentEditable: true },
        description: { type: "textarea", contentEditable: true },
        backgroundColor: CustomColorField as any,
        paddingTop: PaddingField as any,
        paddingBottom: PaddingField as any,
      },
      defaultProps: {
        imageSide: "left",
        imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
        title: "Stunning Architecture",
        description: "Experience modern living with bespoke design.",
        backgroundColor: "#ffffff",
        paddingTop: 64,
        paddingBottom: 64,
      },
      render: ({ imageSide, imageUrl, title, description, backgroundColor, paddingTop, paddingBottom }) => {
        return (
          <div style={{ backgroundColor, paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}>
            <div className={`max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-8 items-center ${imageSide === "left" ? "" : "md:flex-row-reverse"}`}>
              <div className="w-full md:w-1/2">
                <img src={imageUrl} alt="Feature visual" className="w-full aspect-[4/3] object-cover rounded-lg shadow-lg" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <h3 className="text-3xl font-display text-text-primary">{title}</h3>
                <p className="text-text-primary/70 leading-relaxed text-lg">{description}</p>
              </div>
            </div>
          </div>
        );
      }
    }
  }
}
};

export const BASELINE_LAYOUT = {
  content: [
    {
      type: "Hero",
      props: { id: "hero-1" }
    },
    {
      type: "Portfolio",
      props: { id: "portfolio-main", panel: "main" }
    },
    {
      type: "Contact",
      props: { id: "contact-1" }
    },
    {
      type: "Footer",
      props: { id: "footer-1" }
    }
  ],
  zones: {
    side: [
      {
        type: "TextContent",
        props: { 
          id: "brand-header-1",
          title1: "EXPOSED",
          title2: "BRICK",
          accent: "MEDIA",
          tagline: "HIGH-FIDELITY ARCHITECTURAL NARRATIVES"
        }
      },
      {
        type: "Services",
        props: { id: "services-1" }
      },
      {
        type: "Portfolio",
        props: { id: "portfolio-side", panel: "side" }
      }
    ]
  },
  root: { props: { title: "Home" } }
};
