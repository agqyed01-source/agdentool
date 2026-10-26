import React, { useState } from 'react';
import { getOptimizedImageUrl, getOptimizedSrcSet } from '../utils/image';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt?: string;
  widthParam?: number;
  qualityParam?: number;
  priority?: boolean;
  responsive?: boolean;
  fallbackSrc?: string;
  containerClassName?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = '',
  widthParam,
  qualityParam = 80,
  priority = false,
  responsive = false,
  fallbackSrc,
  className = '',
  containerClassName = '',
  onLoad,
  onError,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const initialSrc = src ? getOptimizedImageUrl(src, widthParam, qualityParam) : '';
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  // If the src prop changes
  React.useEffect(() => {
    if (src) {
      setCurrentSrc(getOptimizedImageUrl(src, widthParam, qualityParam));
      setHasError(false);
      setIsLoaded(false);
    }
  }, [src, widthParam, qualityParam]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If optimized URL failed, try loading original unproxied source as fallback
    if (src && currentSrc !== src) {
      setCurrentSrc(src);
    } else if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
    if (onError) onError(e);
  };

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 ${containerClassName}`}
        aria-label={alt || 'Image unavailable'}
      >
        <ImageIcon size={24} className="opacity-40" />
      </div>
    );
  }

  const srcSet = responsive && src ? getOptimizedSrcSet(src) : undefined;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Subtle skeleton shimmer before load */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse pointer-events-none" />
      )}
      <img
        src={currentSrc}
        srcSet={srcSet}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...rest}
      />
    </div>
  );
};
