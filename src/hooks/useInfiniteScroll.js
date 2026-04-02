import { useState, useRef, useCallback } from 'react';

const useInfiniteScroll = (items, initialCount = 20, loadMoreCount = 20) => {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const observerRef = useRef(null);

  const setTargetRef = useCallback(
    (node) => {
      // Disconnect the old observer if it exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Create a new observer
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
          // Wrap in requestAnimationFrame to avoid ResizeObserver/IntersectionObserver loop errors on heavy renders
          requestAnimationFrame(() => {
            setVisibleCount((prevCount) => prevCount + loadMoreCount);
          });
        }
      });

      // Observe the node
      if (node) {
        observerRef.current.observe(node);
      }
    },
    [visibleCount, items.length, loadMoreCount]
  );

  return {
    visibleItems: items ? items.slice(0, visibleCount) : [],
    setTargetRef,
    visibleCount
  };
};

export default useInfiniteScroll;
