import { useState, useRef, useEffect, useCallback } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export const useEmojiPicker = (
  onEmojiSelect: (emoji: string) => void,
  buttonRef: React.RefObject<HTMLButtonElement>
) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null!);
  const { isDark } = useThemeStore();

  const handleEmojiSelect = useCallback(
    (emoji: any, event: MouseEvent) => {
      event.stopPropagation();
      onEmojiSelect(emoji.native);
    },
    [onEmojiSelect]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  return {
    showEmojiPicker,
    setShowEmojiPicker,
    emojiPickerRef,
    handleEmojiSelect,
  };
};