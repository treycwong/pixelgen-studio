
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (base64: string, url: string) => void;
  disabled: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const url = URL.createObjectURL(file);
        onImageSelect(base64, url);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative group transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={triggerUpload}
        disabled={disabled}
        className="w-full py-12 px-8 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center gap-4 hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
      >
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-200">Upload Image</p>
          <p className="text-sm text-slate-500">JPG, PNG or GIF (Max 10MB)</p>
        </div>
      </button>
    </div>
  );
};
