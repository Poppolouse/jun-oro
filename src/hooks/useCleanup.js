import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing cleanup operations
 * Helps prevent memory leaks by properly cleaning up resources
 * @param {Function} cleanupFn - Cleanup function to execute
 * @param {Array} deps - Dependency array for effect
 */
function useCleanup(cleanupFn, deps = []) {
  const cleanupRef = useRef(null);

  useEffect(() => {
    // Store previous cleanup function
    const prevCleanup = cleanupRef.current;

    // Execute previous cleanup if exists
    if (prevCleanup) {
      prevCleanup();
    }

    // Store new cleanup function
    cleanupRef.current = cleanupFn;

    // Return cleanup function for React's cleanup
    return () => {
      if (cleanupFn) {
        cleanupFn();
      }
      cleanupRef.current = null;
    };
  }, deps);
}

/**
 * Custom hook for managing event listeners with automatic cleanup
 * @param {Element} target - Event target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler function
 * @param {object} options - Event listener options
 */
function useEventListener(target, event, handler, options = {}) {
  const savedHandler = useRef(handler);
  const savedOptions = useRef(options);

  // Update handler ref if handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  // Update options ref if options change
  useEffect(() => {
    savedOptions.current = options;
  }, [options]);

  useEffect(() => {
    // Make sure element supports addEventListener
    if (!target || !target.addEventListener) return;

    // Create event handler that calls latest handler
    const eventListener = (event) => {
      savedHandler.current(event);
    };

    // Add event listener
    target.addEventListener(event, eventListener, savedOptions.current);

    // Return cleanup function
    return () => {
      target.removeEventListener(event, eventListener, savedOptions.current);
    };
  }, [target, event]);
}

/**
 * Custom hook for managing timers with automatic cleanup
 * @param {Function} callback - Timer callback function
 * @param {number} delay - Timer delay in milliseconds
 * @param {Array} deps - Dependency array for effect
 */
function useTimer(callback, delay, deps = []) {
  const timeoutRef = useRef(null);
  const savedCallback = useRef(callback);

  // Update callback ref if callback changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timer if delay is provided
    if (delay !== null && delay !== undefined) {
      timeoutRef.current = setTimeout(() => {
        savedCallback.current();
      }, delay);
    }

    // Return cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [delay, ...deps]);
}

/**
 * Custom hook for managing intervals with automatic cleanup
 * @param {Function} callback - Interval callback function
 * @param {number} interval - Interval time in milliseconds
 * @param {Array} deps - Dependency array for effect
 */
function useInterval(callback, interval, deps = []) {
  const intervalRef = useRef(null);
  const savedCallback = useRef(callback);

  // Update callback ref if callback changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set new interval if interval is provided
    if (interval !== null && interval !== undefined) {
      intervalRef.current = setInterval(() => {
        savedCallback.current();
      }, interval);
    }

    // Return cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, ...deps]);
}

/**
 * Custom hook for managing animations with automatic cleanup
 * @param {Function} animationFn - Animation function
 * @param {Array} deps - Dependency array for effect
 */
function useAnimation(animationFn, deps = []) {
  const animationRef = useRef(null);
  const savedAnimationFn = useRef(animationFn);

  // Update animation function ref if it changes
  useEffect(() => {
    savedAnimationFn.current = animationFn;
  }, [animationFn]);

  useEffect(() => {
    // Cancel existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Start new animation
    const animate = () => {
      savedAnimationFn.current();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Return cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, deps);
}

/**
 * Custom hook for managing subscriptions with automatic cleanup
 * @param {Function} subscribe - Subscribe function that returns unsubscribe
 * @param {Array} deps - Dependency array for effect
 * @returns {any} - Current subscription value
 */
function useSubscription(subscribe, deps = []) {
  const subscriptionRef = useRef(null);
  const [value, setValue] = useState(null);

  useEffect(() => {
    // Unsubscribe from previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current();
    }

    // Subscribe to new subscription
    const unsubscribe = subscribe(setValue);
    subscriptionRef.current = unsubscribe;

    // Return cleanup function
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, deps);

  return value;
}

/**
 * Custom hook for managing external script loading
 * @param {string} src - Script source URL
 * @param {object} options - Script loading options
 * @returns {boolean} - Script loading status
 */
function useExternalScript(src, options = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      setIsLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = src;
    script.async = options.async !== false;
    script.defer = options.defer === true;

    // Handle script load
    const handleLoad = () => {
      setIsLoaded(true);
      setError(null);
    };

    // Handle script error
    const handleError = () => {
      setError(new Error(`Failed to load script: ${src}`));
      setIsLoaded(false);
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    // Add script to document
    document.head.appendChild(script);
    scriptRef.current = script;

    // Return cleanup function
    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);

      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
      scriptRef.current = null;
    };
  }, [src, options.async, options.defer]);

  return { isLoaded, error };
}

export {
  useCleanup,
  useEventListener,
  useTimer,
  useInterval,
  useAnimation,
  useSubscription,
  useExternalScript,
};

export default useCleanup;
