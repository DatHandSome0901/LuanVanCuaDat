import React, { useState, useEffect } from 'react';

interface SecureImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  isBackground?: boolean;
  children?: React.ReactNode;
}

// Global cache for secure image blob URLs to prevent redundant network fetches
const secureImageCache: Record<string, string> = {};

// Helper to bypass ngrok browser warning by appending query parameter
const bypassNgrok = (url: string): string => {
  if (!url) return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.includes('ngrok-free.dev') || url.includes('ngrok-free.app')) {
    const separator = url.includes('?') ? '&' : '?';
    if (!url.includes('ngrok-skip-browser-warning')) {
      return `${url}${separator}ngrok-skip-browser-warning=true`;
    }
  }
  return url;
};

const SecureImage: React.FC<SecureImageProps> = ({ 
  src, alt, className, style, isBackground, children 
}) => {
  const bypassedSrc = src ? bypassNgrok(src) : '';
  const [safeSrc, setSafeSrc] = useState<string>(secureImageCache[src] || '');

  useEffect(() => {
    if (!src) {
      setSafeSrc('');
      return;
    }

    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setSafeSrc(src);
      return;
    }

    if (secureImageCache[src]) {
      setSafeSrc(secureImageCache[src]);
      return;
    }

    // Reset safeSrc to empty to fallback to bypassedSrc immediately during fetch
    setSafeSrc('');

    let isMounted = true;
    const bypassed = bypassNgrok(src);

    const loadImage = async () => {
      try {
        const response = await fetch(bypassed, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (!response.ok) throw new Error('Failed to load image');
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        secureImageCache[src] = objectUrl;
        if (isMounted) {
          setSafeSrc(objectUrl);
        }
      } catch (error) {
        console.error('Error loading secure image:', error);
        if (isMounted) {
          setSafeSrc(bypassed); // Fallback to bypassed link
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  const activeSrc = safeSrc || bypassedSrc;

  if (isBackground) {
    return (
      <div 
        className={className} 
        style={{ 
          ...style, 
          backgroundImage: activeSrc ? `url(${activeSrc})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <img 
      src={activeSrc} 
      alt={alt} 
      className={className} 
      style={style} 
    />
  );
};

export default SecureImage;
