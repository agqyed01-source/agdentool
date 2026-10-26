/**
 * Image Optimization Utilities
 * Generates URLs pointing to the server-side WebP image optimizer and caching pipeline.
 */

export function getOptimizedImageUrl(
  src: string | undefined | null,
  width?: number,
  quality: number = 80
): string {
  if (!src) return '';
  
  // Skip local relative assets, data URLs, blob URLs, and already-optimized URLs
  if (
    src.startsWith('data:') ||
    src.startsWith('blob:') ||
    src.startsWith('/api/img') ||
    src.endsWith('.svg')
  ) {
    return src;
  }

  // Ensure absolute URL
  const trimmed = src.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed;
  }

  const params = new URLSearchParams();
  params.set('url', trimmed);
  if (width && width > 0) {
    params.set('w', width.toString());
  }
  if (quality && quality > 0 && quality < 100) {
    params.set('q', quality.toString());
  }

  return `/api/img?${params.toString()}`;
}

/**
 * Generate srcset for responsive image rendering
 */
export function getOptimizedSrcSet(
  src: string | undefined | null,
  widths: number[] = [200, 400, 600, 800]
): string {
  if (!src || src.startsWith('data:') || src.startsWith('blob:') || src.endsWith('.svg')) {
    return '';
  }

  return widths
    .map(w => `${getOptimizedImageUrl(src, w)} ${w}w`)
    .join(', ');
}
