import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  AlertCircle,
  RotateCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  uploadImageFile,
  validateImageFile,
  createLocalPreviewUrl,
  revokeLocalPreviewUrl,
} from '../services/imageUploadService';

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  description?: string;
}

interface PendingUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'uploading' | 'failed';
  errorMessage?: string;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images = [],
  onChange,
  maxImages = 10,
  label = 'Product Photography & Gallery',
  description = 'Upload high-resolution photos. The first image will be used as the primary storefront cover.',
}) => {
  // Ensure we only treat verified persisted strings as saved images (exclude any accidental blob: URLs)
  const persistedImages = images.filter((img) => typeof img === 'string' && !img.startsWith('blob:'));

  const [pendingItems, setPendingItems] = useState<PendingUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      pendingItems.forEach((item) => {
        revokeLocalPreviewUrl(item.previewUrl);
      });
    };
  }, []);

  const uploadSingleFile = async (item: PendingUploadItem, currentPersisted: string[]) => {
    try {
      const resolvedUrl = await uploadImageFile(item.file, 'products');
      // Upload succeeded: revoke temporary local preview
      revokeLocalPreviewUrl(item.previewUrl);
      // Remove from pending
      setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
      // Append verified public URL to persisted images
      onChange([...currentPersisted, resolvedUrl]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setPendingItems((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? { ...p, status: 'failed', errorMessage: msg }
            : p
        )
      );
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const incomingFiles: File[] = Array.from(files);
    if (incomingFiles.length === 0) return;

    const totalActiveCount = persistedImages.length + pendingItems.length;
    if (totalActiveCount >= maxImages) {
      setErrorMessage(`Maximum limit of ${maxImages} images already reached.`);
      return;
    }

    const availableSlots = maxImages - totalActiveCount;
    const filesToConsider = incomingFiles.slice(0, availableSlots);

    if (incomingFiles.length > availableSlots) {
      setErrorMessage(
        `Only ${availableSlots} more image slot${availableSlots > 1 ? 's' : ''} available (limit: ${maxImages}).`
      );
    }

    // Strict validation: JPG, PNG, WEBP, max 5MB, reject GIF
    const validItems: PendingUploadItem[] = [];
    for (const file of filesToConsider) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file.');
        return;
      }

      const previewUrl = createLocalPreviewUrl(file);
      validItems.push({
        id: `pending-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl,
        status: 'uploading',
      });
    }

    if (validItems.length === 0) return;

    // Add to pending state
    setPendingItems((prev) => [...prev, ...validItems]);

    // Attempt upload for each file sequentially / concurrently
    let workingPersisted = [...persistedImages];
    for (const item of validItems) {
      try {
        const resolvedUrl = await uploadImageFile(item.file, 'products');
        revokeLocalPreviewUrl(item.previewUrl);
        setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
        workingPersisted = [...workingPersisted, resolvedUrl];
        onChange(workingPersisted);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Backend upload failed.';
        setPendingItems((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, status: 'failed', errorMessage: msg }
              : p
          )
        );
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetryUpload = (item: PendingUploadItem) => {
    setPendingItems((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: 'uploading', errorMessage: undefined } : p))
    );
    uploadSingleFile(item, persistedImages);
  };

  const handleRemovePending = (item: PendingUploadItem) => {
    revokeLocalPreviewUrl(item.previewUrl);
    setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
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

  const handleRemovePersistedImage = (index: number) => {
    const updated = persistedImages.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = persistedImages[index];
    const rest = persistedImages.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const copy = [...persistedImages];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const handleMoveRight = (index: number) => {
    if (index === persistedImages.length - 1) return;
    const copy = [...persistedImages];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    onChange(copy);
  };

  const totalSlotsUsed = persistedImages.length + pendingItems.length;

  return (
    <div className="space-y-3">
      {/* Header Label and Counter */}
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
            {totalSlotsUsed} / {maxImages} photos
          </span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#2d5a61] bg-[#2d5a61]/5 dark:border-[#c59d5f] dark:bg-[#c59d5f]/10'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-11 h-11 rounded-xl bg-white dark:bg-gray-800 shadow-xs border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#2d5a61] dark:text-[#c59d5f]">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              <span className="text-[#2d5a61] dark:text-[#c59d5f] hover:underline">
                Click to browse files
              </span>{' '}
              or drag and drop multiple pictures
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              JPG, PNG, WEBP up to 5MB each. (GIF not supported).
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

      {/* Pending / Uploading / Failed Files Section */}
      {pendingItems.length > 0 && (
        <div className="space-y-2 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending Laravel Upload ({pendingItems.length})
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-normal">
              Not saved to database until uploaded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 p-2 bg-white dark:bg-gray-800 rounded-lg border border-amber-200/80 dark:border-gray-700"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <img
                    src={item.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {item.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB •{' '}
                    {item.status === 'uploading' ? (
                      <span className="text-[#2d5a61] dark:text-teal-400 font-medium">
                        Uploading to Laravel...
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        Backend unreachable
                      </span>
                    )}
                  </p>
                  {item.errorMessage && (
                    <p className="text-[9px] text-rose-500 line-clamp-1 mt-0.5">
                      {item.errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {item.status === 'failed' && (
                    <button
                      type="button"
                      onClick={() => handleRetryUpload(item)}
                      className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs"
                      title="Retry upload"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemovePending(item)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 text-xs"
                    title="Remove pending file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persisted Uploaded Images Gallery Grid */}
      {persistedImages.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Persisted Photos ({persistedImages.length})
            </span>
            <span>Hover photo for cover & ordering controls</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {persistedImages.map((imgUrl, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={`${imgUrl.slice(0, 40)}-${idx}`}
                  className={`group relative rounded-xl overflow-hidden border transition-all duration-200 aspect-square bg-gray-100 dark:bg-gray-800 ${
                    isCover
                      ? 'border-[#2d5a61] ring-2 ring-[#2d5a61]/30 dark:border-[#c59d5f] dark:ring-[#c59d5f]/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Product photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.img-error-fallback')) {
                        const fallback = document.createElement('div');
                        fallback.className =
                          'img-error-fallback w-full h-full flex flex-col items-center justify-center p-2 text-center text-gray-400 bg-gray-100 dark:bg-gray-800';
                        fallback.innerHTML =
                          '<span class="text-[10px]">Image preview unavailable</span>';
                        parent.appendChild(fallback);
                      }
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
                          handleRemovePersistedImage(idx);
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
                          disabled={idx === persistedImages.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveRight(idx);
                          }}
                          className={`p-1 rounded-md text-white ${
                            idx === persistedImages.length - 1
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
            {totalSlotsUsed < maxImages && (
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
              alt="Enlarged view"
              className="max-w-full max-h-[80vh] object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

