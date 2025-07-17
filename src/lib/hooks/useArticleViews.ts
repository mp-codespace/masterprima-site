// src\lib\hooks\useArticleViews.ts

import { useEffect, useCallback } from 'react';

interface UseArticleViewsOptions {
  articleId: string;
  enabled?: boolean;
  delay?: number;
}

export function useArticleViews({ 
  articleId, 
  enabled = true, 
  delay = 2000 
}: UseArticleViewsOptions) {
  
  const trackView = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/auth-mp-secure-2024/articles/${id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to track view');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error tracking article view:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !articleId) return;

    // Track view after delay (to ensure user actually reads)
    const timer = setTimeout(() => {
      trackView(articleId);
    }, delay);

    return () => clearTimeout(timer);
  }, [articleId, enabled, delay, trackView]);

  return { trackView };
}

// Alternative: Hook for manual tracking
export function useTrackView() {
  const trackView = useCallback(async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to track view');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error tracking article view:', error);
      return null;
    }
  }, []);

  return trackView;
}