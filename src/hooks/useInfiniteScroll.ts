// hooks/useInfiniteScroll.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollProps<T> {
  fetchData: (offset: number, limit: number) => Promise<T[]>;
  limit?: number;
}

export function useInfiniteScroll<T>({
  fetchData,
  limit = 5,
}: UseInfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const offset = items.length;
      const newItems = await fetchData(offset, limit);

      setItems((prev) => {
        const existingIds = new Set((prev as any[]).map((i: any) => i.id));
        const unique = newItems.filter((i: any) => !existingIds.has(i.id));
        return [...prev, ...unique];
      });

      if (newItems.length < limit) setHasMore(false);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, hasMore, items, limit, loading]);

  useEffect(() => {
    fetchMore();
  }, []);

  useEffect(() => {
    if (loading || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchMore();
      }
    });

    const ref = lastItemRef.current;
    if (ref) observer.current.observe(ref);

    return () => {
      if (ref) observer.current?.unobserve(ref);
    };
  }, [items, fetchMore, hasMore, loading]);

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item: any) => item.id !== id));
  };

  return {
    items,
    loading,
    hasMore,
    lastItemRef,
    removeItem,
  };
}
