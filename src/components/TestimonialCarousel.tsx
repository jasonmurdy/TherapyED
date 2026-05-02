import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export const TestimonialCarousel = ({ maxItems = 5 }: { maxItems?: number }) => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('order', 'asc'), limit(maxItems));
    return onSnapshot(q, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [maxItems]);

  if (testimonials.length === 0) return null;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const getFontSize = (text: string) => {
    const length = text?.length || 0;
    if (length < 60) return 'text-3xl md:text-5xl';
    if (length < 120) return 'text-2xl md:text-4xl';
    if (length < 200) return 'text-xl md:text-3xl';
    return 'text-lg md:text-2xl';
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-16 px-6 overflow-hidden">
      <div className="flex items-center justify-center mb-8 text-brick-copper opacity-50">
        <Quote size={32} />
      </div>
      
      <div className="relative min-h-[300px] md:min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center text-center w-full"
          >
            <p className={`font-display italic ${getFontSize(testimonials[currentIndex]?.quote)} text-text-primary mb-10 leading-tight transition-all duration-500`}>
              "{testimonials[currentIndex]?.quote}"
            </p>
            <div className="flex items-center gap-4">
              {testimonials[currentIndex]?.headshotUrl && (
                <img src={testimonials[currentIndex]?.headshotUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-border-subtle" loading="lazy" decoding="async" />
              )}
              <div className="text-left">
                <h4 className="text-xs uppercase tracking-widest text-brick-copper font-bold">{testimonials[currentIndex]?.name}</h4>
                <p className="text-[9px] uppercase tracking-widest text-text-primary/60">{testimonials[currentIndex]?.brokerage}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {testimonials.length > 1 && (
        <div className="flex justify-center gap-8 mt-12">
          <button onClick={handlePrev} className="p-3 border border-border-subtle text-text-primary/40 hover:text-bg-primary hover:bg-brick-copper hover:border-brick-copper transition-all duration-300 hover:-translate-y-0.5 active:scale-90 rounded-full">
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2 items-center">
            {testimonials.map((_, idx) => (
              <div key={idx} className={`w-1.5 h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? 'bg-brick-copper scale-150' : 'bg-text-primary/20'}`} />
            ))}
          </div>
          <button onClick={handleNext} className="p-3 border border-border-subtle text-text-primary/40 hover:text-bg-primary hover:bg-brick-copper hover:border-brick-copper transition-all duration-300 hover:-translate-y-0.5 active:scale-90 rounded-full">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
