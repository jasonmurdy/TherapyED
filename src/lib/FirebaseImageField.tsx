import React, { useState, useRef } from 'react';
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Image as ImageIcon, UploadCloud, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';

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

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full h-8 text-xs flex gap-2">
              <ImageIcon size={14} />
              {value ? "Change Image" : "Upload Image"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
              <DialogDescription>
                Drag and drop your image or click to browse.
              </DialogDescription>
            </DialogHeader>
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`
                mt-4 border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-colors
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/50 hover:bg-muted'}
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
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-sm font-medium">Uploading... {Math.round(progress)}%</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">Click or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF</p>
                </>
              )}
            </div>
            
            <div className="relative flex items-center my-4">
              <div className="w-full border-t border-border" />
              <div className="absolute left-1/2 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground uppercase">
                Or paste URL
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Input 
                value={preview} 
                placeholder="https://" 
                onChange={(e) => setPreview(e.target.value)} 
                className="flex-1"
              />
              <Button size="sm" onClick={() => { onChange(preview); setIsOpen(false); }}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
};
