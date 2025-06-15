// src\app\api\auth-mp-secure-2024\articles\[id]\view.ts

import { useEffect, useCallback } from 'react';

interface UseArticleViewsOptions {
  articleId: string;
  enabled?: boolean;
  delay?: number;
}

/**
 * Automatically tracks article view after a delay (default 2s)
 * Usage: useArticleViews({ articleId });
 */
export function useArticleViews({
  articleId,
  enabled = true,
  delay = 2000,
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
        const text = await response.text();
        console.error('Failed to track view:', text);
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

    const timer = setTimeout(() => {
      trackView(articleId);
    }, delay);

    return () => clearTimeout(timer);
  }, [articleId, enabled, delay, trackView]);

  return { trackView };
}

/**
 * Manual tracking hook (call it wherever/whenever you want)
 * Usage: const trackView = useTrackView(); trackView(articleId);
 */
export function useTrackView() {
  const trackView = useCallback(async (articleId: string) => {
    try {
      const response = await fetch(`/api/auth-mp-secure-2024/articles/${articleId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to track view:', text);
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
