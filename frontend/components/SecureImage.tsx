import React, { useState, useEffect } from 'react';

interface SecureImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  isBackground?: boolean;
  children?: React.ReactNode;
}

const SecureImage: React.FC<SecureImageProps> = ({ 
  src, alt, className, style, isBackground, children 
}) => {
  const [safeSrc, setSafeSrc] = useState<string>('');

  useEffect(() => {
    if (!src) return;

    // Nếu là link base64 hoặc blob thì dùng luôn
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setSafeSrc(src);
      return;
    }

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
        setSafeSrc(objectUrl);
      } catch (error) {
        console.error('Error loading secure image:', error);
        setSafeSrc(src); // Fallback về link gốc
      }
    };

    loadImage();

    return () => {
      if (safeSrc.startsWith('blob:')) {
        URL.revokeObjectURL(safeSrc);
      }
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
