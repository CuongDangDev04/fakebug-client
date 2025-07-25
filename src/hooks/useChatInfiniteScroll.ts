'use client'
import { useEffect, useState, useRef } from 'react';

export const useChatInfiniteScroll = (
  messagesContainerRef: React.RefObject<HTMLDivElement>,
  loadMore: () => Promise<void>,
  messages: any[]
) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 20;
      setShowScrollToBottom(!isAtBottom);

      if (container.scrollTop <= 200 && !loadingMore) {
        setLoadingMore(true);
        const prevScrollHeight = container.scrollHeight;
        const prevMsgLength = messages.length;
        await loadMore();

        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          if (messages.length > prevMsgLength) {
            container.scrollTop = newScrollHeight - prevScrollHeight;
          }
          setLoadingMore(false);
        }, 0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMore, loadingMore, messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 20;
    setShowScrollToBottom(!isAtBottom);
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && messages.length > 0 && isFirstLoadRef.current) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
      isFirstLoadRef.current = false;
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  return { loadingMore, showScrollToBottom, scrollToBottom };
};