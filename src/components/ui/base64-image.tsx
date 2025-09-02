import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { validateBase64ImageSrc } from '@/utils/imageUtils';

interface Base64ImageProps {
  src: string;
  alt?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  onClick?: () => void;
}

export function Base64Image({
  src,
  alt = 'Image',
  className,
  maxWidth = 300,
  maxHeight = 200,
  onClick
}: Base64ImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [triedSanitize, setTriedSanitize] = useState(false);

  const validatedSrc = validateBase64ImageSrc(src);
  const [srcToUse, setSrcToUse] = useState<string | null>(validatedSrc);

  // Keep srcToUse in sync if prop changes
  React.useEffect(() => {
    const next = validateBase64ImageSrc(src);
    setSrcToUse(next);
    setImageError(false);
    setTriedSanitize(false);
    const isDataUrl = !!next && next.startsWith('data:image/');
    setIsLoading(!isDataUrl);
  }, [src]);

  function sanitizeDataUrl(input: string | null): string | null {
    if (!input) return null;
    if (!input.startsWith('data:image/')) return input;
    const commaIdx = input.indexOf(',');
    if (commaIdx === -1) return input;
    const prefix = input.slice(0, commaIdx + 1);
    let payload = input.slice(commaIdx + 1);
    // Remove whitespace and any non-base64 chars
    payload = payload.replace(/\s+/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
    // Pad to multiple of 4
    const mod = payload.length % 4;
    if (mod === 1) {
      // drop 1 stray char if present
      payload = payload.slice(0, -1);
    } else if (mod > 0) {
      payload = payload + '='.repeat(4 - mod);
    }
    return prefix + payload;
  }

  if (!srcToUse || imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md text-gray-500 text-sm",
          className
        )}
        style={{ maxWidth, maxHeight: Math.min(maxHeight, 100) }}
      >
        {imageError ? 'Failed to load image' : 'Invalid image'}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block", className)}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-md"
          style={{ maxWidth, maxHeight }}
        >
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      )}
      {srcToUse && (
        <img
          src={srcToUse}
          alt={alt}
          className={cn(
            "rounded-md border border-gray-200 object-contain",
            onClick && "cursor-pointer hover:opacity-80 transition-opacity",
            isLoading && "opacity-0"
          )}
          style={{
            maxWidth,
            maxHeight,
            display: isLoading ? 'none' : 'block'
          }}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            if (!triedSanitize) {
              const sanitized = sanitizeDataUrl(srcToUse);
              setTriedSanitize(true);
              if (sanitized && sanitized !== srcToUse) {
                setSrcToUse(sanitized);
                setIsLoading(true);
                setImageError(false);
                return;
              }
            }
            setImageError(true);
            setIsLoading(false);
          }}
          onClick={onClick}
        />
      )}
    </div>
  );
}
