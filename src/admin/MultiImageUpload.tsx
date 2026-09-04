import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Link as LinkIcon,
  Eye,
  AlertCircle,
  Check,
} from 'lucide-react';

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  description?: string;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images = [],
  onChange,
  maxImages = 10,
  label = 'Product Photography & Gallery',
  description = 'Upload multiple high-resolution photos. The first image will be used as the primary storefront cover.',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to process multiple File objects
  const handleFiles = (files: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      } else {
        setErrorMessage('Only image files (JPEG, PNG, WEBP, GIF) are allowed.');
      }
    }

    if (validFiles.length === 0) return;

    if (images.length + validFiles.length > maxImages) {
      setErrorMessage(`Maximum limit of ${maxImages} images reached.`);
    }

    const availableSlots = maxImages - images.length;
    const filesToProcess = validFiles.slice(0, availableSlots);

    if (filesToProcess.length === 0) return;

    setIsProcessing(true);
    const readers = filesToProcess.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((newBase64Images) => {
        onChange([...images, ...newBase64Images]);
      })
      .catch((err) => {
        console.error('Error processing images:', err);
        setErrorMessage('Failed to process some images.');
      })
      .finally(() => {
        setIsProcessing(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    // Support comma or newline separated URLs
    const urls = urlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image')));

    if (urls.length === 0) {
      setErrorMessage('Please enter a valid image URL (e.g. https://...)');
      return;
    }

    if (images.length + urls.length > maxImages) {
      setErrorMessage(`Maximum limit of ${maxImages} images reached.`);
    }

    const availableSlots = maxImages - images.length;
    const urlsToAdd = urls.slice(0, availableSlots);

    onChange([...images, ...urlsToAdd]);
    setUrlInput('');
    setShowUrlInput(false);
    setErrorMessage(null);
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const copy = [...images];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const copy = [...images];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {/* Header Label and Stats */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
            {label}
          </label>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {images.length} / {maxImages} photos
          </span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-[#2d5a61] dark:text-[#c59d5f] hover:underline flex items-center gap-1 font-medium"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL' : 'Add via URL'}</span>
          </button>
        </div>
      </div>

      {/* Optional URL input box */}
      {showUrlInput && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 animate-in fade-in">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste image web link (or comma separated URLs)"
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#2d5a61]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddUrl()}
              className="px-3 py-1.5 bg-[#2d5a61] hover:bg-[#1e3c41] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Tip: You can paste direct links from Unsplash, Google Drive image links, or CDN URLs.
          </p>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#2d5a61] bg-[#2d5a61]/5 dark:border-[#c59d5f] dark:bg-[#c59d5f]/10'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-xs border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#2d5a61] dark:text-[#c59d5f]">
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-[#2d5a61] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              <span className="text-[#2d5a61] dark:text-[#c59d5f] hover:underline">
                Click to browse files
              </span>{' '}
              or drag and drop multiple pictures
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              JPG, PNG, WEBP up to 10MB each. Select multiple files at once.
            </p>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Images Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((imgUrl, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={`${imgUrl.slice(0, 30)}-${idx}`}
                  className={`group relative rounded-xl overflow-hidden border transition-all duration-200 aspect-square bg-gray-100 dark:bg-gray-800 ${
                    isCover
                      ? 'border-[#2d5a61] ring-2 ring-[#2d5a61]/30 dark:border-[#c59d5f] dark:ring-[#c59d5f]/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Jewelry product image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1611591475819-797de2338ec8?w=500&auto=format&fit=crop&q=60';
                    }}
                  />

                  {/* Primary Cover Badge */}
                  {isCover && (
                    <div className="absolute top-1.5 left-1.5 bg-[#2d5a61] text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-current text-amber-300" />
                      <span>Cover</span>
                    </div>
                  )}

                  {/* Image Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    {/* Top action row: view preview & remove */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(imgUrl);
                        }}
                        className="p-1 rounded-md bg-white/20 hover:bg-white/40 text-white transition-colors"
                        title="Zoom Image"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="p-1 rounded-md bg-rose-500/80 hover:bg-rose-600 text-white transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom action row: set cover & order arrows */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLeft(idx);
                          }}
                          className={`p-1 rounded-md text-white ${
                            idx === 0
                              ? 'opacity-30 cursor-not-allowed'
                              : 'bg-white/20 hover:bg-white/40'
                          }`}
                          title="Move left"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveRight(idx);
                          }}
                          className={`p-1 rounded-md text-white ${
                            idx === images.length - 1
                              ? 'opacity-30 cursor-not-allowed'
                              : 'bg-white/20 hover:bg-white/40'
                          }`}
                          title="Move right"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {!isCover && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetCover(idx);
                          }}
                          className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold rounded-md flex items-center gap-0.5 shadow-sm"
                          title="Make this the main cover image"
                        >
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Set Cover</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Add more button in the grid */}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#2d5a61] dark:hover:border-[#c59d5f] flex flex-col items-center justify-center gap-1.5 p-3 text-gray-400 hover:text-[#2d5a61] dark:hover:text-[#c59d5f] transition-all aspect-square bg-gray-50/50 dark:bg-gray-800/30"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Add Photo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lightbox / Preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-gray-900 rounded-2xl overflow-hidden p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Enlarged jewelry view"
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
