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

const SecureImage: React.FC<SecureImageProps> = ({ 
  src, alt, className, style, isBackground, children 
}) => {
  const [safeSrc, setSafeSrc] = useState<string>(secureImageCache[src] || '');

  useEffect(() => {
    if (!src) return;

    // Nếu là link base64 hoặc blob thì dùng luôn
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setSafeSrc(src);
      return;
    }

    // Nếu đã có trong cache, dùng luôn
    if (secureImageCache[src]) {
      setSafeSrc(secureImageCache[src]);
      return;
    }

    let isMounted = true;

    const loadImage = async () => {
      try {
        const response = await fetch(src, {
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
          setSafeSrc(src); // Fallback về link gốc
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (isBackground) {
    return (
      <div 
        className={className} 
        style={{ 
          ...style, 
          backgroundImage: safeSrc ? `url(${safeSrc})` : undefined,
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
      src={safeSrc || src} 
      alt={alt} 
      className={className} 
      style={style} 
    />
  );
};

export default SecureImage;
