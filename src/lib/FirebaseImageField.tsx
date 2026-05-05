import React, { useState, useRef } from 'react';
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Image as ImageIcon, UploadCloud, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Local Minimalist UI Components to avoid shadcn dependency errors
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string, size?: string }>(
  ({ className = '', variant = 'solid', size = 'default', ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    const variants: Record<string, string> = {
      solid: "bg-brick-copper text-charcoal hover:bg-brick-copper/90",
      outline: "border border-brick-copper/30 bg-transparent hover:bg-brick-copper/10 text-brick-copper"
    };
    const sizes: Record<string, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-xs"
    };
    return <button ref={ref} className={`${base} ${variants[variant] || variants.solid} ${sizes[size] || sizes.default} ${className}`} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} className={`flex h-10 w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brick-copper/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
  )
);
Input.displayName = "Input";

const Label = ({ className = '', children, ...props }: any) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>{children}</label>
);

export const FirebaseImageField = {
  type: "custom" as const,
  render: ({ name, value, onChange }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState(value || '');
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
      if (!file) return;
      
      // If storage is not configured properly, fallback to fake URL or complain
      if (!storage) {
        alert("Firebase Storage is not completely configured. Using a local blob instead for preview.");
        const url = URL.createObjectURL(file);
        setPreview(url);
        onChange(url);
        setIsOpen(false);
        return;
      }

      setUploading(true);
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          console.error('Upload failed:', error);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setPreview(downloadURL);
          onChange(downloadURL);
          setUploading(false);
          setIsOpen(false);
        }
      );
    };

    const onDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(true);
    };

    const onDragLeave = () => {
      setDragActive(false);
    };

    const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUpload(e.dataTransfer.files[0]);
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase text-gray-500 font-semibold tracking-wider">{name}</Label>
        
        <div className="flex gap-1">
          <Input 
            value={value || ''} 
            placeholder="Image URL (https://...)" 
            onChange={(e) => onChange(e.target.value)} 
            className="flex-1 h-8 text-[11px] font-mono"
          />
          <Button 
            onClick={() => setIsOpen(true)}
            variant="outline" 
            size="sm" 
            className="h-8 px-2 aspect-square flex items-center justify-center border-brick-copper/30 text-brick-copper hover:bg-brick-copper hover:text-charcoal transition-all"
          >
            <UploadCloud size={14} />
          </Button>
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onClick={() => setIsOpen(false)}
                  className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md bg-charcoal border border-brick-copper/30 rounded-xl p-8 shadow-3xl text-text-primary"
                >
                  <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                    <X size={20} />
                  </button>
                  <h3 className="font-display italic text-2xl mb-2">Upload Resource</h3>
                  <p className="text-[10px] uppercase tracking-widest text-brick-copper/60 mb-6">Cloud Storage Matrix</p>
                  
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => !uploading && inputRef.current?.click()}
                    className={`
                      mt-4 border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                      ${dragActive ? 'border-brick-copper bg-brick-copper/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}
                      ${uploading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                  >
                    <input 
                      type="file" 
                      ref={inputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                      }}
                    />
                    {uploading ? (
                      <>
                        <Loader2 className="w-10 h-10 animate-spin text-brick-copper mb-6" />
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-2">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progress}%` }}
                             className="h-full bg-brick-copper"
                           />
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold">Synchronizing... {Math.round(progress)}%</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-10 h-10 text-brick-copper mb-4" />
                        <p className="text-[10px] uppercase tracking-widest font-bold text-white">Select from Archive</p>
                        <p className="text-[9px] text-white/30 mt-3 text-center uppercase tracking-tighter">High-fidelity flambient recommended (max 5MB)</p>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {value && (
          <div className="relative group w-full aspect-video bg-gray-100 rounded-md overflow-hidden border border-border">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => { onChange(''); setPreview(''); }}
              className="absolute top-1 right-1 bg-black/50 hover:bg-black p-1 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }
};
