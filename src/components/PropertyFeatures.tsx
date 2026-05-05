import React from 'react';

export const PropertyHighlight = ({ 
  mediaUrl, 
  mediaType, 
  daysOnMarket, 
  salePrice, 
  listPrice, 
  packageUsed 
}: { 
  mediaUrl: string, 
  mediaType: 'image' | 'video', 
  daysOnMarket: number, 
  salePrice: string, 
  listPrice: string, 
  packageUsed: string 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border-subtle group">
      <div className="relative aspect-square md:aspect-auto md:h-full overflow-hidden bg-bg-primary/5">
        {mediaType === 'video' ? (
          mediaUrl ? <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" /> : null
        ) : (
          mediaUrl ? <img src={mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Highlight" /> : null
        )}
      </div>
      <div className="p-8 md:p-16 flex flex-col justify-center bg-bg-primary">
        <h3 className="font-display italic text-3xl mb-12 text-text-primary">Project Economics</h3>
        <div className="space-y-8">
          <div className="border-b border-border-subtle pb-4">
            <span className="block text-[9px] uppercase tracking-[0.3em] text-brick-copper mb-2">Days on Market</span>
            <span className="font-mono text-2xl text-text-primary">{daysOnMarket}</span>
          </div>
          <div className="border-b border-border-subtle pb-4">
            <span className="block text-[9px] uppercase tracking-[0.3em] text-brick-copper mb-2">Sale vs List Price</span>
            <div className="flex gap-4 items-baseline">
              <span className="font-mono text-2xl text-text-primary">{salePrice}</span>
              <span className="font-mono text-xs text-text-primary/40 line-through">{listPrice}</span>
            </div>
          </div>
          <div className="pt-4">
            <span className="block text-[9px] uppercase tracking-[0.3em] text-brick-copper mb-2">Media Package Utilized</span>
            <span className="text-sm font-semibold uppercase tracking-widest text-text-primary">{packageUsed}</span>
          </div>
        </div>
        <div className="mt-12 text-[10px] text-text-primary/40 italic flex justify-end">
          Powered by REALTOR.ca
        </div>
      </div>
    </div>
  );
};

export const TourEmbed = ({ url, height = 600 }: { url: string, height?: number }) => {
  if (!url) return <div className="w-full bg-bg-primary/5 border border-dashed border-border-subtle flex items-center justify-center p-12 text-[10px] uppercase tracking-widest text-text-primary/30">Connect Tour URL to Embed</div>;
  
  return (
    <div className="w-full border border-border-subtle overflow-hidden relative group">
      <div className="absolute top-4 right-4 bg-bg-primary/80 backdrop-blur-md border border-border-subtle px-4 py-2 pointer-events-none z-10 flex items-center gap-2">
         <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
         <span className="text-[9px] uppercase tracking-widest font-bold">Interactive Origin</span>
      </div>
      <iframe 
        src={url || undefined} 
        width="100%" 
        height={height} 
        frameBorder="0" 
        allow="xr-spatial-tracking; vr; gyroscope; accelerometer; fullscreen; autoplay"
        allowFullScreen 
        className="w-full"
      />
    </div>
  );
};
