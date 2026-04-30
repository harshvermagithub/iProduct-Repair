'use client';

import { useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { uploadImage } from '@/actions/upload';

export default function ImageUploader({ onUploadComplete }: { onUploadComplete: (urls: string[]) => void }) {
    const [urls, setUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        const newUrls = [...urls];
        
        for (let i = 0; i < e.target.files.length; i++) {
            const formData = new FormData();
            formData.append('file', e.target.files[i]);
            try {
                const url = await uploadImage(formData);
                newUrls.push(url);
            } catch (err) {
                console.error("Upload failed", err);
            }
        }
        
        setUrls(newUrls);
        onUploadComplete(newUrls);
        setUploading(false);
    };

    const removeImage = (index: number) => {
        const next = urls.filter((_, i) => i !== index);
        setUrls(next);
        onUploadComplete(next);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {urls.map((url, i) => (
                    <div key={url} className="relative w-24 h-24 border rounded-lg overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                        <button 
                            type="button" 
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-black p-1 text-white rounded-full transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                
                <label className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 text-muted-foreground hover:text-primary rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors">
                    {uploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    ) : (
                        <>
                            <Camera className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-medium text-center px-1">Add Photo</span>
                        </>
                    )}
                    <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        capture="environment" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={uploading}
                    />
                </label>
            </div>
        </div>
    );
}
