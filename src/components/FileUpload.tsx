import React, { useRef, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { Upload, X, Check, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  path: string;
  label: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, path, label }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setUploading(true);
    setError(null);

    if (!storage) {
      setError('Storage service is not available. Please enable Cloud Storage in your Firebase Console.');
      setUploading(false);
      return;
    }

    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (err: any) => {
        console.error("Upload error:", err);
        let message = 'Upload failed.';
        
        if (err.code === 'storage/retry-limit-exceeded') {
          message = 'Maximum retry time exceeded. This often happens if Cloud Storage is not yet enabled in your Firebase Console. Please go to the Firebase Console -> Storage -> Click "Get Started".';
        } else if (err.code === 'storage/unauthorized') {
          message = 'Permission denied. Please check your Firebase Storage security rules in the console.';
        } else if (err.code === 'storage/canceled') {
          message = 'Upload canceled.';
        }
        
        setError(message);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onUploadComplete(downloadURL);
        setUploading(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUploadComplete(urlInput.trim());
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest text-white/30 block">{label}</label>
        
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL here..."
            className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-[10px] text-white/60 focus:border-brick-copper outline-none transition-colors font-mono"
          />
          <button 
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="px-3 py-2 bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-brick-copper hover:text-charcoal transition-all disabled:opacity-30 font-bold"
          >
            Apply URL
          </button>
        </div>

        <div className="relative flex items-center my-4">
          <div className="w-full border-t border-white/5" />
          <div className="absolute left-1/2 -translate-x-1/2 bg-charcoal px-2 text-[8px] text-white/20 uppercase tracking-widest">
            Or upload
          </div>
        </div>

        <div 
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border border-dashed border-white/10 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brick-copper/50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-5 h-5 text-brick-copper animate-spin mb-2" />
              <span className="text-[10px] font-mono text-white/40">{Math.round(progress)}%</span>
              <div className="w-24 h-1 bg-white/5 mt-2 overflow-hidden">
                <div 
                  className="h-full bg-brick-copper transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-5 h-5 text-white/20 mb-2" />
              <span className="text-[10px] text-white/40 uppercase tracking-tighter">Choose File or Drag & Drop</span>
            </>
          )}
        </div>
      </div>
      {error && <p className="text-[10px] text-red-500 font-mono mt-1">{error}</p>}
    </div>
  );
};
