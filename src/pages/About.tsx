import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col w-full min-h-screen"
    >
      <Helmet>
        <title>About | Therapy With Edward</title>
      </Helmet>
      
      <div className="w-full px-8 md:px-12 lg:px-16 py-6 border-b border-border-subtle flex items-center gap-4 text-[10px] uppercase tracking-widest text-text-primary/60">
        <Link to="/" className="hover:text-brick-copper transition-colors">Home</Link>
        <span>/</span>
        <span className="text-text-primary">About the Practice</span>
      </div>

      <div className="p-8 md:p-16 lg:p-24 max-w-4xl">
        <h2 className="font-display text-5xl mb-8 italic">Presence in transition.<br/>Space for healing.</h2>
        
        <div className="space-y-8 text-text-primary/70 leading-relaxed font-body">
          <p className="text-lg">
            At our practice, we believe that every individual holds the capacity for profound growth and resilience. 
            Our mission is to provide a sanctuary where your narrative can be explored with compassion, depth, and clinical excellence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 pt-16 border-t border-border-subtle">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-brick-copper font-bold">The Philosophy</h4>
              <p>Utilizing evidence-based modalities and a person-centered approach to facilitate meaningful change and emotional well-being.</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-brick-copper font-bold">The Commitment</h4>
              <p>Confidentiality, empathetic listening, and a dedicated partnership in your journey toward mental health clarity.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
