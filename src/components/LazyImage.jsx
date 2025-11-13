import { useState, useRef, useEffect } from "react";

/**
 * Lazy loading image component for performance optimization
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - CSS classes
 * @param {object} style - Inline styles
 * @param {number} threshold - Distance from viewport to start loading (default: 200px)
 * @param {string} placeholder - Placeholder image or color
 * @returns {JSX.Element} - Optimized image component
 */
function LazyImage({
  src,
  alt = "",
  className = "",
  style = {},
  threshold = 200,
  placeholder = "#f3f4f",
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`lazy-image-error ${className}`}
        style={{
          backgroundColor: placeholder,
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        <span className="text-red-500">Image failed to load</span>
      </div>
    );
  }

  return (
    <div
      className={`lazy-image-container ${className}`}
      style={style}
      role="img"
      aria-label={alt}
    >
      {!isLoaded && (
        <div
          className="lazy-image-placeholder"
          style={{ backgroundColor: placeholder }}
        />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          ...style,
        }}
      />
    </div>
  );
}

export default LazyImage;
