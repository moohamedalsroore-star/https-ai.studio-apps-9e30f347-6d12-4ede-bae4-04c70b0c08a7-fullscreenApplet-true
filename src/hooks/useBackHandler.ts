import { useEffect, useRef } from 'react';

interface BackHandlerOptions {
  isOpen: boolean;
  onClose: () => void;
  stateKey?: string;
}

/**
 * Registers an entry in window.history when a modal or preview opens,
 * and intercepts the browser/Android back button or swipe-back gesture
 * to close the modal instead of navigating away or closing the app.
 */
export function useBackHandler({ isOpen, onClose, stateKey = 'modal' }: BackHandlerOptions) {
  const isPushedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Push history state so the back gesture/button closes the modal
      window.history.pushState({ [stateKey]: true }, '');
      isPushedRef.current = true;

      const handlePopState = () => {
        isPushedRef.current = false;
        onClose();
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        // If unmounting while still pushed, pop it cleanly
        if (isPushedRef.current) {
          isPushedRef.current = false;
          // window.history.back(); // optional, avoided to prevent double back
        }
      };
    }
  }, [isOpen, onClose, stateKey]);
}
