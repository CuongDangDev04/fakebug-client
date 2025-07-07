'use client';

import Link from 'next/link';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus';
import { useEffect, useMemo, useRef, useState } from 'react';
import Loader from '@/components/common/users/Loader';
import { useFriendMessagesStore } from '@/stores/friendMessagesStore';
import { ChatBoxProps } from '@/types/chatBoxProps';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { EllipsisVertical, Laugh } from 'lucide-react';


export default function ChatBox({ currentUserId, targetUserId, onOpenSidebar }: ChatBoxProps & { onOpenSidebar?: () => void }) {
  const { messages, loading, loadMore } = useChatMessages(currentUserId, targetUserId);
  const { isOnline: isTargetOnline, lastSeen, formatLastSeen } = useUserOnlineStatus(targetUserId);
  const markAsReadInSidebar = useFriendMessagesStore((state) => state.markAsRead);

  const [input, setInput] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showTime, setShowTime] = useState<{ [id: string]: boolean }>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const [openedOptionsMsgId, setOpenedOptionsMsgId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const reactionEmojis = ['❤️', '😆', '😮', '😢', '😡', '👍', '👎'];
  const [openedReactionMsgId, setOpenedReactionMsgId] = useState<number | null>(null);


  useEffect(() => {
    const hasUnread = messages.some(msg => msg.sender.id === targetUserId && !msg.is_read);
    if (hasUnread) {
      const socket = (window as any).chatSocket;
      socket?.emit('markAsRead', {
        fromUserId: targetUserId,
        toUserId: currentUserId,
      });
      markAsReadInSidebar(targetUserId);
    }
  }, [messages, currentUserId, targetUserId, markAsReadInSidebar]);

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

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 20;
      setShowScrollToBottom(!isAtBottom);

      if (container.scrollTop <= 20 && !loadingMore) {
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


  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;

    const socket = (window as any).chatSocket;
    socket?.emit('sendMessage', {
      senderId: currentUserId,
      receiverId: targetUserId,
      content,
    });

    setInput('');
    setShowEmojiPicker(false)
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const uniqueMessages = useMemo(() => {
    const seen = new Set();
    return messages.filter((msg) => {
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  }, [messages]);

  const lastSentByMe = [...uniqueMessages].reverse().find((msg) => msg.sender.id === currentUserId);

  const targetUser = messages[0]?.sender.id === currentUserId ? messages[0]?.receiver : messages[0]?.sender;

  const isFirstLoadRef = useRef(true);
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && messages.length > 0 && isFirstLoadRef.current) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
      isFirstLoadRef.current = false;
    }
  }, [targetUserId, messages.length]);
  const handleReactToMessage = (messageId: number, emoji: string | null) => {
    const socket = (window as any).chatSocket;

    if (emoji) {
      socket?.emit('reactToMessage', {
        messageId,
        userId: currentUserId,
        emoji,
      });
    } else {
      socket?.emit('removeReaction', {
        messageId,
        userId: currentUserId,
      });
    }

    setShowEmojiPicker(false);
  };

  return (
    <div className="flex flex-col h-full border rounded bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border md:rounded-none md:border-none w-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-gray-50 dark:bg-dark-hover border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-light transition-colors">
        <button
          className="md:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-dark-hover"
          onClick={onOpenSidebar}
          aria-label="Mở danh sách chat"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <Link
          href={`/trang-ca-nhan/${targetUser?.id ?? targetUserId}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="relative">
            <img
              src={targetUser?.avatar_url || '/default-avatar.png'}
              className="w-10 h-10 rounded-full object-cover"
              alt="avatar"
            />
            {isTargetOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-card rounded-full"></span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-gray-900 dark:text-dark-text-primary truncate">
              {`${targetUser?.first_name ?? ''} ${targetUser?.last_name ?? ''}` || 'Đối phương'}
            </span>
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
              {isTargetOnline ? 'Đang hoạt động' : lastSeen ? formatLastSeen(lastSeen) : 'Ngoại tuyến'}
            </span>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-4 relative md:px-3" style={{ minHeight: 0, maxHeight: 'calc(100vh - 120px)' }}>
        {loading && <div className="text-gray-700 dark:text-dark-text-primary">Đang tải...</div>}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader />
          </div>
        )}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed left-1/2 transform -translate-x-1/2 bottom-24 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
            style={{ width: 44, height: 44 }}
            aria-label="Cuộn xuống cuối"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M12 16c-.28 0-.53-.11-.71-.29l-6-6a1.003 1.003 0 011.42 1.42L12 13.59l5.29-5.3a1.003 1.003 0 111.42 1.42l-6 6c-.18.18-.43.29-.71.29z" fill="currentColor" />
            </svg>
          </button>
        )}
        {uniqueMessages.map((msg, idx) => {
          const isMe = msg.sender.id === currentUserId;
          const isLastSentByMe = msg.id === lastSentByMe?.id;
          const wasRead = msg.is_read;
          const sentAt = (msg as any).sent_at || msg.createdAt;

          return (
            <div
              key={msg.id || idx}
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => setHoveredMsgId(msg.id)}
              onMouseLeave={() => setHoveredMsgId(null)}
            >
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[75%]`}>
                  {!isMe && (
                    <img
                      className="rounded-full w-8 h-8 object-cover"
                      src={(msg.sender as any).avatar_url}
                      alt="avatar"
                    />
                  )}

                  <div className="flex flex-col items-start">
                    {/* Message bubble và icon */}
                    <div className={`flex items-start ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-1`}>
                      {/* Nội dung tin nhắn */}
                      <div className="relative inline-block">
                        {/* Nội dung tin nhắn */}
                        <div
                          className={`px-4 py-2 break-words max-w-[320px] cursor-pointer ${isMe
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-dark-hover text-gray-900 dark:text-dark-text-primary'
                            }`}
                          style={{
                            borderRadius: 20,
                            borderTopRightRadius: 20,
                            borderTopLeftRadius: 20,
                            borderBottomRightRadius: isMe ? 6 : 20,
                            borderBottomLeftRadius: isMe ? 20 : 6,
                          }}
                          onClick={() =>
                            setShowTime((prev) => ({
                              ...prev,
                              [msg.id]: !prev[msg.id],
                            }))
                          }
                        >
                          {(msg as any).is_revoked ? (
                            <i className="text-sm text-white dark:text-dark-text-secondary italic">
                              Tin nhắn đã được thu hồi
                            </i>
                          ) : (
                            msg.content
                          )}
                        </div>

                        {/* Hiển thị reactions nếu có */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-dark-card rounded-full border shadow px-[6px] py-[1px] text-sm flex items-center">
                            {Object.entries(
                              msg.reactions.reduce((acc: Record<string, number>, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([emoji, count]) => (
                              <span key={emoji} className="mx-0.5">
                                {emoji}
                                {count > 1 && <span className="ml-0.5 text-xs">{count}</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>


                      {/* Hiển thị icon nếu đang hover và chưa thu hồi */}
                      {hoveredMsgId === msg.id && !(msg as any).is_revoked && (
                        <div className={`flex items-center gap-1 self-stretch ${isMe ? 'flex-row-reverse' : ''}`}>


                          {/* Icon mặt cười */}
                          <div
                            className="text-gray-500 hover:text-yellow-500 cursor-pointer relative"
                            onClick={() =>
                              setOpenedReactionMsgId((prev) => (prev === msg.id ? null : msg.id))
                            }
                          >
                            <Laugh />
                            {openedReactionMsgId === msg.id && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white dark:bg-dark-card border rounded shadow z-50 flex space-x-1">
                                {reactionEmojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      handleReactToMessage(msg.id, emoji);
                                      setOpenedReactionMsgId(null);
                                    }}
                                    className="text-xl hover:scale-110 transition-transform"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Icon ba chấm */}
                          <div className="relative flex items-center ">
                            <button
                              ref={buttonRef}
                              className="text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                              onClick={() =>
                                setOpenedOptionsMsgId((prev) => (prev === msg.id ? null : msg.id))
                              }
                            >
                              <EllipsisVertical />
                            </button>

                            {/* Dropdown menu hiển thị trên */}
                            {openedOptionsMsgId === msg.id && (
                              <div
                                ref={dropdownRef}
                                className="absolute bottom-full right-0 mb-1 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded shadow-md py-1 z-30 min-w-[120px]"
                              >
                                {/* Nếu là tin nhắn của mình mới hiển thị "Chỉnh sửa" và "Thu hồi" */}
                                {isMe && (
                                  <>
                                    <button
                                      className="block w-full text-left text-sm px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-hover"
                                      onClick={() => {
                                        setOpenedOptionsMsgId(null);
                                        alert('Chức năng chỉnh sửa đang được phát triển');
                                      }}
                                    >
                                      Chỉnh sửa
                                    </button>
                                    <button
                                      className="block w-full text-left text-sm px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-hover"
                                      onClick={() => {
                                        const socket = (window as any).chatSocket;
                                        socket?.emit('revokeMessage', { messageId: msg.id });
                                        setOpenedOptionsMsgId(null);
                                      }}
                                    >
                                      Thu hồi
                                    </button>
                                  </>
                                )}

                                {/* Còn lại luôn hiện */}
                                <button
                                  className="block w-full text-left text-sm px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-hover"
                                  onClick={() => {
                                    setOpenedOptionsMsgId(null);
                                    alert('Chức năng chuyển tiếp đang được phát triển');
                                  }}
                                >
                                  Chuyển tiếp
                                </button>
                                <button
                                  className="block w-full text-left text-sm px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-hover"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.content);
                                    setOpenedOptionsMsgId(null);
                                  }}
                                >
                                  Sao chép
                                </button>
                              </div>
                            )}

                          </div>

                        </div>
                      )}
                    </div>

                    {/* Hiển thị thời gian & đã xem */}
                    {showTime[msg.id] && (
                      <div className="text-[11px] text-gray-500 dark:text-dark-text-secondary mt-0.5">
                        {sentAt && new Date(sentAt).toLocaleString()}
                      </div>
                    )}
                    {isMe && isLastSentByMe && wasRead && (
                      <div className="text-[11px] text-blue-500 dark:text-blue-400 mt-0.5">Đã xem</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-2 border-t flex items-center gap-2 border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card relative">
        <input
          className="flex-1 border rounded px-3 py-2 text-gray-900 dark:text-dark-text-primary bg-white dark:bg-dark-card placeholder-gray-400 dark:placeholder-dark-text-secondary"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Nhập tin nhắn..."
        />

        {/* Nút emoji */}
        <button
          ref={buttonRef}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-2xl hover:text-yellow-500"
          type="button"
        >
          <Laugh />
        </button>


        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute  bottom-full right-2 mb-2 z-50">
            <Picker
              data={data}
              onEmojiSelect={(emoji: any) => {
                setInput((prev) => prev + emoji.native);
              }}
              theme="light"
            />
          </div>
        )}



        <button
          className="bg-blue-500 text-white dark:text-dark-text-primary px-4 py-2 rounded"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Gửi
        </button>
      </div>

    </div>
  );
}