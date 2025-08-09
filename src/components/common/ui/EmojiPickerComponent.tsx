import { memo } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useThemeStore } from '@/stores/themeStore';

interface EmojiPickerComponentProps {
  show: boolean;
  onEmojiSelect: (emoji: any, event: MouseEvent) => void;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
}

const EmojiPickerComponent = memo(({ show, onEmojiSelect, emojiPickerRef }: EmojiPickerComponentProps) => {
  const { isDark } = useThemeStore();

  if (!show) return null;

  return (
    <div ref={emojiPickerRef} className="absolute bottom-full right-2 mb-2 z-[1000]">
      <Picker
        data={data}
        onEmojiSelect={onEmojiSelect}
        theme={isDark ? 'dark' : 'light'}
        previewPosition="none"
      />
    </div>
  );
});

export default EmojiPickerComponent;