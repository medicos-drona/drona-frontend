/**
 * Utility functions for handling images, including base64 detection and conversion
 */

/**
 * Checks if a string is a base64 encoded image
 */
export function isBase64Image(str: string): boolean {
  if (!str || typeof str !== 'string') return false;

  // Check for data URL format with payload validation
  const dataUrlMatch = str.match(/^data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64,([A-Za-z0-9+/=\s]+)$/i);
  if (dataUrlMatch) {
    const payload = dataUrlMatch[2].replace(/\s+/g, '');
    if (payload.length <= 100) return false;
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Pattern.test(payload);
  }

  // Check for raw base64 (without data URL prefix)
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
  return str.length > 100 && base64Pattern.test(str);
}

/**
 * Converts a base64 string to a data URL if it's not already one
 * Also handles cases where the data URL prefix is duplicated
 */
export function ensureDataUrl(base64String: string): string {
  if (!base64String) return '';

  // Handle duplicated data URL prefixes (e.g., "data:image/jpeg;base64,data:image/jpeg;base64,...")
  const duplicatedPrefixPattern = /^(data:image\/[^;]+;base64,)(data:image\/[^;]+;base64,)/;
  if (duplicatedPrefixPattern.test(base64String)) {
    // Remove the first occurrence of the duplicated prefix
    base64String = base64String.replace(duplicatedPrefixPattern, '$2');
  }

  // Handle cases where there might be multiple data: prefixes
  const multiplePrefixPattern = /^(data:image\/[^;]+;base64,)+/;
  const prefixMatch = base64String.match(multiplePrefixPattern);
  if (prefixMatch) {
    // Extract just the base64 part after all prefixes
    const prefixLength = prefixMatch[0].length;
    const base64Part = base64String.substring(prefixLength);

    // Get the last valid prefix
    const lastPrefixMatch = prefixMatch[0].match(/data:image\/[^;]+;base64,$/);
    if (lastPrefixMatch) {
      return lastPrefixMatch[0] + base64Part;
    }
  }

  // If it's already a data URL, return as is
  if (base64String.startsWith('data:image/')) {
    return base64String;
  }

  // If it's raw base64, add the data URL prefix
  // Default to JPEG for better compatibility
  return `data:image/jpeg;base64,${base64String}`;
}

/**
 * Find matching image key for a given image reference
 */
function findMatchingImageKey(imageRef: string, questionImages: Record<string, string>): string | null {
  // Direct match
  if (questionImages[imageRef]) {
    return imageRef;
  }

  // Try variations
  const variations = [
    imageRef,
    imageRef.replace('.jpeg', '').replace('.jpg', '').replace('.png', ''),
    `img-${imageRef}`,
    `image-${imageRef}`,
    imageRef.replace('img-', '').replace('image-', '')
  ];

  for (const variation of variations) {
    for (const key of Object.keys(questionImages)) {
      if (key.includes(variation) || variation.includes(key)) {
        return key;
      }
    }
  }

  // Try extracting numbers and matching
  const numbers = imageRef.match(/\d+/g);
  if (numbers) {
    for (const num of numbers) {
      for (const key of Object.keys(questionImages)) {
        if (key.includes(num)) {
          return key;
        }
      }
    }
  }

  return null;
}

/**
 * Extracts and processes images from text content
 * Returns an object with cleaned text and extracted images
 * Can also match image references with question image data
 */
export function extractImagesFromText(
  text: string,
  questionImages?: Record<string, string>,
  opts?: { maxImages?: number }
): {
  cleanText: string;
  images: Array<{ id: string; src: string; alt: string }>;
} {
  if (!text) return { cleanText: text, images: [] };

  const images: Array<{ id: string; src: string; alt: string }> = [];
  let cleanText = text;
  const maxImages = Math.max(1, Math.min(opts?.maxImages ?? 20, 100)); // safety bounds

  // Helper function to check if a string is a valid base64 image
  function isBase64Image(str: string): boolean {
    try {
      // Remove data URL prefix if present and whitespace/newlines
      const base64Part = str.replace(/^data:image\/[^;]+;base64,/, '').replace(/\s+/g, '');

      // Quick sanity: base64 charset only
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Part)) {
        return false;
      }

      // Must be reasonably large to be an image
      if (base64Part.length < 100) return false;

      // Heuristic: verify known image magic numbers by base64 prefix
      const header = base64Part.substring(0, 12);
      const looksLikeImage = (
        header.startsWith('/9j/') ||           // JPEG
        header.startsWith('iVBORw0K') ||       // PNG
        header.startsWith('R0lGOD') ||         // GIF
        header.startsWith('UklGR') ||          // WebP
        header.startsWith('PHN2') ||           // '<svg' (base64)
        header.startsWith('PD94')              // '<?xml' (base64)
      );
      return looksLikeImage;
    } catch {
      return false;
    }
  }

  // Helper function to ensure proper data URL format
  function ensureDataUrl(src: string): string {
    if (src.startsWith('data:image/')) {
      return src;
    }
    
    // Try to detect image type from base64 header
    const header = src.substring(0, 20);
    let mimeType = 'image/jpeg'; // default
    
    if (header.startsWith('/9j/')) mimeType = 'image/jpeg';
    else if (header.startsWith('iVBORw0K')) mimeType = 'image/png';
    else if (header.startsWith('R0lGOD')) mimeType = 'image/gif';
    else if (header.startsWith('UklGR')) mimeType = 'image/webp';
    
    return `data:${mimeType};base64,${src}`;
  }

  // Helper function to find matching image key
  function findMatchingImageKey(imageSrc: string, images: Record<string, string>): string | null {
    // Direct key match
    if (images[imageSrc]) return imageSrc;
    
    // Try common variations
    const variations = [
      imageSrc,
      imageSrc.toLowerCase(),
      `image-${imageSrc}`,
      `img-${imageSrc}`,
      imageSrc.replace(/[^a-zA-Z0-9]/g, ''),
    ];
    
    for (const variation of variations) {
      if (images[variation]) return variation;
    }
    
    return null;
  }

  // First, look for HTML img tags
  const htmlImagePattern = /<img\s+[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*\/?>/gi;
  const htmlMatches = [...text.matchAll(htmlImagePattern)];

  if (htmlMatches.length > 0) {
    htmlMatches.forEach((match, index) => {
      if (images.length >= maxImages) return;
      const fullMatch = match[0];
      let imageSrc = match[1];
      const altText = match[2] || `Image ${images.length + 1}`;
      imageSrc = imageSrc.trim();

      const containsBase64 = imageSrc.includes('base64,') || isBase64Image(imageSrc);

      if (containsBase64) {
        const imageId = `extracted-image-html-${index}`;
        const validatedSrc = ensureDataUrl(imageSrc);

        images.push({ id: imageId, src: validatedSrc, alt: altText });
        cleanText = cleanText.replace(fullMatch, '');
      }
    });
  }

  // Second, look for markdown-style ![alt](...)
  const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const markdownMatches = [...cleanText.matchAll(markdownImagePattern)];

  if (markdownMatches.length > 0) {
    markdownMatches.forEach((match, index) => {
      if (images.length >= maxImages) return;
      const fullMatch = match[0];
      const altText = match[1] || `Image ${images.length + 1}`;
      let imageSrc = match[2].trim();

      const containsBase64 = imageSrc.includes('base64,') || isBase64Image(imageSrc);

      if (containsBase64) {
        const imageId = `extracted-image-markdown-${index}`;
        const validatedSrc = ensureDataUrl(imageSrc);

        images.push({ id: imageId, src: validatedSrc, alt: altText });
        cleanText = cleanText.replace(fullMatch, '');
      } else if (questionImages) {
        const imageKey = findMatchingImageKey(imageSrc, questionImages);
        if (imageKey && questionImages[imageKey]) {
          const imageId = `extracted-image-ref-${index}`;
          const validatedSrc = ensureDataUrl(questionImages[imageKey]);

          images.push({ id: imageId, src: validatedSrc, alt: altText });
          cleanText = cleanText.replace(fullMatch, '');
        } else {
          cleanText = cleanText.replace(fullMatch, `[Missing Image: ${imageSrc}]`);
        }
      } else {
        cleanText = cleanText.replace(fullMatch, `[Image: ${imageSrc}]`);
      }
    });
  }

  // Third, look for complete data URLs - IMPROVED PATTERN
  // This pattern is more robust and handles multiline base64 data better
  const dataUrlPattern = /data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=\s\r\n]+/g;
  const dataUrlMatches = [...cleanText.matchAll(dataUrlPattern)];

  if (dataUrlMatches.length > 0) {
    dataUrlMatches.forEach((match, index) => {
      if (images.length >= maxImages) return;
      const fullMatch = match[0];
      // Clean up the base64 data by removing whitespace and newlines
      const cleanedMatch = fullMatch.replace(/\s+/g, '');

      // Validate that this is actually a complete base64 image
      if (isBase64Image(cleanedMatch)) {
        const imageId = `extracted-image-dataurl-${index}`;
        const imageSrc = ensureDataUrl(cleanedMatch);

        images.push({
          id: imageId,
          src: imageSrc,
          alt: `Extracted image ${images.length + 1}`
        });

        // Remove from text
        cleanText = cleanText.replace(fullMatch, '');
      }
    });
  }

  // Fourth, look for raw base64 strings (improved)
  // This handles cases where the data URL prefix might be missing
  // const rawBase64Pattern = /\b[A-Za-z0-9+/]{100,}={0,2}\b/g;
  const rawBase64Pattern = /([A-Za-z0-9+/]{20,}={0,2})(?=\s|[^A-Za-z0-9+/=]|$)/g;
  const rawBase64Matches = [...cleanText.matchAll(rawBase64Pattern)];

  if (rawBase64Matches.length > 0) {
    rawBase64Matches.forEach((match, index) => {
      if (images.length >= maxImages) return;
      const base64String = match[0];

      if (isBase64Image(base64String)) {
        const imageId = `extracted-image-raw-${index}`;
        const imageSrc = ensureDataUrl(base64String);

        images.push({
          id: imageId,
          src: imageSrc,
          alt: `Extracted image ${images.length + 1}`
        });

        cleanText = cleanText.replace(base64String, '');
      }
    });
  }

  // Fifth, handle direct http/https image URLs
  const urlPattern = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp|svg))/gi;
  const urlMatches = [...cleanText.matchAll(urlPattern)];

  if (urlMatches.length > 0) {
    urlMatches.forEach((match, index) => {
      if (images.length >= maxImages) return;
      const url = match[1];
      const imageId = `extracted-image-url-${index}`;
      images.push({
        id: imageId,
        src: url,
        alt: `Inline URL image ${images.length + 1}`
      });
      cleanText = cleanText.replace(url, '');
    });
  }

  // Sixth, handle cases where base64 data might be truncated or corrupted
  // Look for patterns that suggest incomplete base64 data
  const partialBase64Pattern = /data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=\s]*[^A-Za-z0-9+/=\s][^}]*\*?\*?/g;
  const partialMatches = [...cleanText.matchAll(partialBase64Pattern)];

  if (partialMatches.length > 0) {
    partialMatches.forEach((match, index) => {
      if (images.length >= maxImages) return;
      const fullMatch = match[0];
      // Try to extract just the valid base64 part
      const base64Match = fullMatch.match(/data:image\/[a-zA-Z]+;base64,([A-Za-z0-9+/=\s]+)/);

      if (base64Match && base64Match[1]) {
        const cleanBase64 = base64Match[1].replace(/\s+/g, '');

        // If we have enough data, try to use it
        if (cleanBase64.length > 100) {
          const imageId = `extracted-image-partial-${index}`;
          const reconstructed = `data:image/jpeg;base64,${cleanBase64}`;

          images.push({
            id: imageId,
            src: reconstructed,
            alt: `Recovered image ${images.length + 1}`
          });
        }
      }

      // Remove the problematic text regardless
      cleanText = cleanText.replace(fullMatch, '');
    });
  }

  // Clean up any remaining artifacts or malformed text
  // Remove patterns like _{4}eXqDhIWGh4iJipKTlJWWl5i** which seem to be corrupted base64
  cleanText = cleanText.replace(/_\{\d+\}[A-Za-z0-9+/=]+\**/g, '');
  
  // Clean up any extra whitespace
  cleanText = cleanText.replace(/\s+/g, ' ').trim();

  return { cleanText, images };
}

/**
 * Component props for rendering base64 images safely
 */
export interface Base64ImageProps {
  src: string;
  alt?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Validates and sanitizes base64 image source
 */
export function validateBase64ImageSrc(src: string): string | null {
  if (!src || !isBase64Image(src)) return null;
  
  try {
    const dataUrl = ensureDataUrl(src);
    // Additional validation could be added here
    return dataUrl;
  } catch (error) {
    console.warn('Invalid base64 image source:', error);
    return null;
  }
}
