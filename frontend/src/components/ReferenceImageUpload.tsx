import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export interface ReferenceImageFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

interface ReferenceImageUploadProps {
  images: ReferenceImageFile[];
  onChange: (images: ReferenceImageFile[]) => void;
  maxFiles?: number;
  maxFileSizeMB?: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

export const ReferenceImageUpload: React.FC<ReferenceImageUploadProps> = ({
  images,
  onChange,
  maxFiles = 6,
  maxFileSizeMB = 5,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const files = Array.from(fileList);
    if (!files.length) return;

    const newImageFiles: ReferenceImageFile[] = [];
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    const errors: string[] = [];

    for (const file of files) {
      // Check total files limit
      if (images.length + newImageFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} reference images allowed.`);
        break;
      }

      // Check file type
      const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
      const isAllowedExt = ALLOWED_EXTENSIONS.test(file.name);
      if (!isAllowedMime && !isAllowedExt) {
        errors.push(`"${file.name}" is not a supported format. Please upload JPG, PNG, or WEBP.`);
        continue;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        errors.push(`"${file.name}" exceeds the ${maxFileSizeMB}MB limit (${formatFileSize(file.size)}).`);
        continue;
      }

      // Prevent duplicate files
      const isDuplicate = images.some(
        (img) => img.name === file.name && img.size === file.size
      ) || newImageFiles.some(
        (img) => img.name === file.name && img.size === file.size
      );

      if (isDuplicate) {
        continue; // silently ignore or skip exact duplicate
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);

      newImageFiles.push({
        id,
        file,
        previewUrl,
        name: file.name,
        size: file.size,
      });
    }

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
    }

    if (newImageFiles.length > 0) {
      onChange([...images, ...newImageFiles]);
    }

    // Reset input so re-selecting the same file if needed triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveImage = (idToRemove: string) => {
    const target = images.find((img) => img.id === idToRemove);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }
    onChange(images.filter((img) => img.id !== idToRemove));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-[#333333]">
            Reference Images <span className="text-[#888888] font-normal">(Optional)</span>
          </label>
          <p className="text-[11px] text-[#666666] mt-0.5">
            Have a design or inspiration in mind? Upload one or more reference images. Optional.
          </p>
        </div>
        {images.length > 0 && (
          <span className="text-[11px] text-[#2d5a61] font-medium">
            {images.length} of {maxFiles} uploaded
          </span>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        id="customization-reference-upload"
      />

      {/* Upload Dropzone / Button */}
      {images.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-[#2d5a61] bg-[#2d5a61]/10 scale-[1.01]'
              : 'border-[#d8cebe] bg-[#efe8dc]/40 hover:bg-[#efe8dc]/70 hover:border-[#2d5a61]/50'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2d5a61] shadow-2xs border border-[#e0d8c8]">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#2d5a61] hover:underline">
              + Upload Reference Images
            </span>
            <p className="text-[10px] sm:text-[11px] text-[#777777] mt-0.5">
              You can upload photos, screenshots, sketches, or inspiration images.
            </p>
            <p className="text-[10px] text-[#999999] mt-0.5">
              Supports JPG, PNG, WEBP (up to {maxFileSizeMB}MB each)
            </p>
          </div>
        </div>
      )}

      {/* Error message alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-400 hover:text-rose-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image Previews Gallery */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative group rounded-xl overflow-hidden border border-[#e0d8c8] bg-white shadow-2xs aspect-square"
              >
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(img.id);
                    }}
                    title="Remove image"
                    className="self-end w-6 h-6 rounded-full bg-white/90 hover:bg-rose-500 hover:text-white text-[#333333] flex items-center justify-center shadow transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-white truncate px-1">
                    {img.name}
                  </p>
                </div>

                {/* Always visible mobile delete button for touch devices */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(img.id);
                  }}
                  className="sm:hidden absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-[#333333] flex items-center justify-center shadow"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
