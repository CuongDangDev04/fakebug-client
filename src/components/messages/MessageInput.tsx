import { useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Laugh, SendHorizontal } from 'lucide-react';
import { useEmojiPicker } from '@/hooks/useEmojiPicker';
import EmojiPickerComponent from '../common/ui/EmojiPickerComponent';

interface MessageInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    handleInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    disabled: boolean;
}

const MessageInput = ({ input, setInput, handleSend, handleInputKeyDown, disabled }: MessageInputProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null!);
    const { showEmojiPicker, setShowEmojiPicker, emojiPickerRef, handleEmojiSelect } = useEmojiPicker(
        (emoji: string) => setInput(input + emoji),
        buttonRef
    );

    return (
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            className="p-2 border-t border-gray-200 dark:border-[#4a4b4c] bg-white dark:bg-[#3a3b3c] flex items-center gap-2 relative">
            <TextareaAutosize
                rows={1}
                className="flex-1 border-0 rounded-xl px-4 py-2 text-sm text-[#050505] dark:text-[#e4e6eb] bg-[#f0f2f5] dark:bg-[#4a4b4c] placeholder-[#65676b] dark:placeholder-[#b0b3b8] focus:outline-none resize-none max-h-[6.5rem] overflow-y-auto"
                style={{ lineHeight: '1.5rem' }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Nhập tin nhắn..."
            />
            <button
                ref={buttonRef}
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="text-[#65676b] dark:text-[#b0b3b8] hover:text-[#0084ff] p-2"
            >
                <Laugh size={20} />
            </button>
            <EmojiPickerComponent
                show={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                emojiPickerRef={emojiPickerRef}
            />
            <button
                className="text-[#0084ff] hover:bg-[#f0f2f5] dark:hover:bg-[#4a4b4c] p-2 rounded-full"
                onClick={handleSend}
                disabled={disabled}
            >
                <SendHorizontal size={20} />
            </button>
        </div>
    );
};

export default MessageInput;