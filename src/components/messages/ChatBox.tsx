'use client';

import Link from 'next/link';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useUserOnlineStatus } from '@/hooks/useUserOnlineStatus';
import { useEffect, useMemo, useRef, useState } from 'react';
import Loader from '@/components/common/users/Loader';
import { useFriendMessagesStore } from '@/stores/friendMessagesStore';
import { ChatBoxProps } from '@/types/chatBoxProps';
import { ArrowDown, EllipsisVertical, Laugh, Phone, SendHorizontal, Video } from 'lucide-react';
import { messageService } from '@/services/messageService';
import { useChatStore } from '@/stores/chatStore';
import ForwardFriendsModal from '@/components/messages/ForwardFriendsModal';
import { useChatInfiniteScroll } from '@/hooks/useChatInfiniteScroll';
import { userService } from '@/services/userService';
import MessageInput from './MessageInput'; // Import component mới
import { toast } from 'sonner';

export default function ChatBox({
  currentUserId,
  targetUserId,
  onStartCall,
  onBack,
}: ChatBoxProps & {
  onStartCall?: (type: 'audio' | 'video') => void;
  onBack?: () => void;
}) {
  const { messages, loading, loadMore } = useChatMessages(currentUserId, targetUserId);
  const { isOnline: isTargetOnline, lastSeen, formatLastSeen } = useUserOnlineStatus(targetUserId);
  const markAsReadInSidebar = useFriendMessagesStore((state) => state.markAsRead);
  const messagesContainerRef = useRef<HTMLDivElement>(null!);
  const { loadingMore, showScrollToBottom, scrollToBottom } = useChatInfiniteScroll(messagesContainerRef, loadMore, messages);

  const [input, setInput] = useState('');
  const [showTime, setShowTime] = useState<{ [id: string]: boolean }>({});
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const [openedOptionsMsgId, setOpenedOptionsMsgId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const reactionEmojis = ['❤️', '😆', '😮', '😢', '😡', '👍', '👎'];
  const [openedReactionMsgId, setOpenedReactionMsgId] = useState<number | null>(null);
  const [viewingReactionsMsg, setViewingReactionsMsg] = useState<number | null>(null);
  const removeMessageById = useChatStore((state) => state.removeMessageById);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardMessageId, setForwardMessageId] = useState<number | null>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedBy, setBlockedBy] = useState<number | null>(null);
  const prevMessagesRef = useRef<typeof messages>([]);

  useEffect(() => {
    const prev = prevMessagesRef.current;
    const curr = messages;

    const prevLast = prev[prev.length - 1];
    const currLast = curr[curr.length - 1];

    if (!prevLast || !currLast || currLast.id !== prevLast.id) {
      const isNewMessageFromOther =
        currLast?.sender?.id === targetUserId && curr.length > prev.length;
      const isNewMessageFromMe =
        currLast?.sender?.id === currentUserId && curr.length > prev.length;

      if (isNewMessageFromMe || isNewMessageFromOther) {
        scrollToBottom();
      }
    }

    prevMessagesRef.current = messages;
  }, [messages, currentUserId, targetUserId, scrollToBottom]);

  useEffect(() => {
    if (!targetUserId) return;
    messageService.checkBlock(targetUserId).then((res) => {
      setIsBlocked(res.isBlocked);
      setBlockedBy(res.blockedBy);
    });
  }, [targetUserId]);

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
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  useEffect(() => {
    if (messages.length > 0) {
      const msg = messages[0];
      const user = msg.sender.id === currentUserId ? msg.receiver : msg.sender;
      setTargetUser(user);
    } else if (!targetUser) {
      userService.getPublicUserInfo(targetUserId).then((res) => {
        if (res) setTargetUser(res);
      });
    }
  }, [messages, currentUserId, targetUserId, targetUser]);

  const handleReactToMessage = (messageId: number, emoji: string | null) => {
    const socket = (window as any).chatSocket;
    const msg = messages.find(m => m.id === messageId);
    if (!msg || !emoji) return;

    const userAlreadyReacted = msg.reactions?.some(r => r.user.id === currentUserId && r.emoji === emoji);

    if (userAlreadyReacted) {
      socket?.emit('removeReaction', {
        messageId,
        userId: currentUserId,
        emoji,
      });
    } else {
      socket?.emit('reactToMessage', {
        messageId,
        userId: currentUserId,
        emoji,
      });
    }
  };

  const handleDeleteMessageForMe = async (messageId: number) => {
    try {
      await messageService.deleteMessageForMe(messageId);
      removeMessageById(messageId);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleForwardMessage = (messageId: number) => {
    setForwardMessageId(messageId);
    setShowForwardModal(true);
  };

  const handleUnblock = async () => {
    try {
      await messageService.unblockUser(targetUserId);
      setIsBlocked(false);
      setBlockedBy(null);
    } catch (error) {
      console.error('Lỗi khi bỏ chặn:', error);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] md:h-[90vh] bg-[#f0f2f5] dark:bg-[#242526] w-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] shadow-sm border-b border-gray-200 dark:border-[#4a4b4c]">
        {onBack && (
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#4a4b4c]"
            onClick={onBack}
            aria-label="Quay lại"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="flex items-center justify-between gap-3 w-full">
          <Link
            href={`/trang-ca-nhan/${targetUser?.id ?? targetUserId}`}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <div className="relative">
              <img
                src={targetUser?.avatar_url || '/default-avatar.png'}
                className="w-9 h-9 rounded-full object-cover"
                alt="avatar"
              />
              {isTargetOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#31a24c] border-2 border-[#f0f2f5] dark:border-[#3a3b3c] rounded-full"></span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-base text-[#050505] dark:text-[#e4e6eb] truncate">
                {`${targetUser?.first_name ?? ''} ${targetUser?.last_name ?? ''}` || 'Đối phương'}
              </span>
              <span className="text-xs text-[#65676b] dark:text-[#b0b3b8] truncate">
                {isTargetOnline ? 'Đang hoạt động' : lastSeen ? formatLastSeen(lastSeen) : 'Ngoại tuyến'}
              </span>
            </div>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => onStartCall?.('audio')}
              className="text-[#0084ff] hover:bg-gray-200 dark:hover:bg-[#4a4b4c] p-2 rounded-full"
            >
              <Phone size={20} />
            </button>
            <button
              onClick={() => onStartCall?.('video')}
              className="text-[#0084ff] hover:bg-gray-200 dark:hover:bg-[#4a4b4c] p-2 rounded-full"
            >
              <Video size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100 dark:bg-dark-bg"
        style={{ minHeight: 0, maxHeight: 'calc(100vh - 120px)' }}
      >
        {loading && <div className="text-[#65676b] dark:text-[#b0b3b8] text-center">Đang tải...</div>}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader />
          </div>
        )}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed left-1/2 transform -translate-x-1/2 bottom-24 z-50 bg-[#0084ff] hover:bg-[#006adc] text-white rounded-full shadow-lg flex items-center justify-center w-10 h-10"
            aria-label="Cuộn xuống cuối"
          >
            <ArrowDown size={20} />
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
                <div className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[70%]`}>
                  {!isMe && (
                    <img
                      className="rounded-full w-7 h-7 object-cover mt-2"
                      src={(msg.sender as any).avatar_url}
                      alt="avatar"
                    />
                  )}
                  <div className="flex flex-col items-start">
                    <div className={`flex items-start ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-1`}>
                      <div className="relative inline-block">
                        <div
                          className={`px-3 py-2 my-2 text-sm max-w-[300px] cursor-pointer ${isMe
                            ? 'bg-[#0084ff] text-white'
                            : 'bg-white dark:bg-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb]'
                            }`}
                          style={{
                            borderRadius: '18px',
                            borderTopRightRadius: isMe ? '6px' : '18px',
                            borderTopLeftRadius: isMe ? '18px' : '6px',
                            borderBottomRightRadius: isMe ? '6px' : '18px',
                            borderBottomLeftRadius: isMe ? '18px' : '6px',
                          }}
                          onClick={() =>
                            setShowTime((prev) => ({
                              ...prev,
                              [msg.id]: !prev[msg.id],
                            }))
                          }
                        >
                          {(msg as any).is_revoked ? (
                            <i className="text-xs italic text-gray-400 dark:text-[#b0b3b8]">
                              Tin nhắn đã được thu hồi
                            </i>
                          ) : msg.content.startsWith('Cuộc gọi') ? (
                            <div
                              className="flex items-center gap-2"
                              onClick={() => onStartCall?.(msg.content.includes('video') ? 'video' : 'audio')}
                            >
                              {msg.content.includes('video') ? (
                                <Video
                                  size={20}
                                  className={
                                    isMe
                                      ? 'text-white dark:text-[#e4e6eb]'
                                      : 'text-[#050505] dark:text-[#e4e6eb]'
                                  }
                                />
                              ) : (
                                <Phone
                                  size={20}
                                  className={
                                    isMe
                                      ? 'text-white dark:text-[#e4e6eb]'
                                      : 'text-[#050505] dark:text-[#e4e6eb]'
                                  }
                                />
                              )}
                              <span>{msg.content}</span>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div
                            onClick={() => setViewingReactionsMsg(msg.id)}
                            className="absolute -bottom-2 -right-2 bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4a4b4c] rounded-full py-0.5 px-1.5 text-sm flex items-center cursor-pointer"
                          >
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
                      {hoveredMsgId === msg.id && !(msg as any).is_revoked && !msg.content.startsWith('Cuộc gọi') && (
                        <div className={`flex items-center gap-1 self-stretch ${isMe ? 'flex-row-reverse' : ''}`}>
                          <div
                            className="text-[#65676b] dark:text-[#b0b3b8] hover:text-[#0084ff] cursor-pointer relative"
                            onClick={() =>
                              setOpenedReactionMsgId((prev) => (prev === msg.id ? null : msg.id))
                            }
                          >
                            <Laugh size={18} />
                            {openedReactionMsgId === msg.id && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4a4b4c] rounded-full shadow z-50 flex space-x-1">
                                {reactionEmojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      handleReactToMessage(msg.id, emoji);
                                      setOpenedReactionMsgId(null);
                                    }}
                                    className="text-lg hover:scale-110 transition-transform"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="relative flex items-center">
                            <button
                              className="text-[#65676b] dark:text-[#b0b3b8] hover:text-[#0084ff]"
                              onClick={() =>
                                setOpenedOptionsMsgId((prev) => (prev === msg.id ? null : msg.id))
                              }
                            >
                              <EllipsisVertical size={18} />
                            </button>
                            {openedOptionsMsgId === msg.id && (
                              <div
                                ref={dropdownRef}
                                className="absolute bottom-full right-0 mb-1 bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4a4b4c] rounded-lg shadow-md py-1 z-30 min-w-[140px]"
                              >
                                {isMe && (
                                  <button
                                    className="block w-full text-left text-sm px-4 py-2 text-[#050505] dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#4a4b4c]"
                                    onClick={() => {
                                      const socket = (window as any).chatSocket;
                                      socket?.emit('revokeMessage', { messageId: msg.id });
                                      setOpenedOptionsMsgId(null);
                                    }}
                                  >
                                    Thu hồi
                                  </button>
                                )}
                                <button
                                  className="block w-full text-left text-sm px-4 py-2 text-[#050505] dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#4a4b4c]"
                                  onClick={() => {
                                    handleForwardMessage(msg.id);
                                    setOpenedOptionsMsgId(null);
                                  }}
                                >
                                  Chuyển tiếp
                                </button>
                                <button
                                  className="block w-full text-left text-sm px-4 py-2 text-[#050505] dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#4a4b4c]"
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.content);
                                    setOpenedOptionsMsgId(null);
                                  }}
                                >
                                  Sao chép
                                </button>
                                <button
                                  className="block w-full text-left text-sm px-4 py-2 text-[#ff3b30] hover:bg-red-50 dark:hover:bg-[#4a4b4c]"
                                  onClick={() => {
                                    handleDeleteMessageForMe(msg.id);
                                    setOpenedOptionsMsgId(null);
                                  }}
                                >
                                  Xóa ở phía tôi
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {showTime[msg.id] && (
                      <div className="text-[10px] text-[#65676b] dark:text-[#b0b3b8] mt-1">
                        {sentAt && new Date(sentAt).toLocaleString()}
                      </div>
                    )}
                    {isMe && isLastSentByMe && wasRead && (
                      <div className="text-[10px] text-[#0084ff] mt-1">Đã xem</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reaction Modal */}
      {viewingReactionsMsg !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setViewingReactionsMsg(null)} />
          <div className="relative bg-white dark:bg-[#3a3b3c] rounded-xl w-[95%] max-w-md max-h-[80vh] overflow-y-auto p-4 shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#4a4b4c] pb-2 mb-3">
              <h2 className="text-base font-semibold text-[#050505] dark:text-[#e4e6eb]">Cảm xúc về tin nhắn</h2>
              <button
                onClick={() => setViewingReactionsMsg(null)}
                className="text-[#65676b] dark:text-[#b0b3b8] hover:text-[#ff3b30] text-lg"
              >
                ×
              </button>
            </div>
            {(() => {
              const msg = messages.find(m => m.id === viewingReactionsMsg);
              if (!msg) return null;

              const grouped = msg.reactions.reduce((acc: Record<string, any[]>, r) => {
                if (!acc[r.emoji]) acc[r.emoji] = [];
                acc[r.emoji].push(r);
                return acc;
              }, {});

              return (
                <>
                  {Object.entries(grouped).map(([emoji, users]) => (
                    <div key={emoji} className="mb-3">
                      <div className="font-medium text-sm mb-2 text-[#65676b] dark:text-[#b0b3b8]">
                        {emoji} {users.length}
                      </div>
                      <div className="space-y-1">
                        {users.map(({ user }) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              const socket = (window as any).chatSocket;
                              socket?.emit('removeReaction', {
                                messageId: msg.id,
                                userId: user.id,
                                emoji,
                              });
                              if (user.id === currentUserId) {
                                setViewingReactionsMsg(null);
                              }
                            }}
                            className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#4a4b4c] cursor-pointer"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <img
                                src={user.avatar_url || '/default-avatar.png'}
                                alt="avatar"
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm text-[#050505] dark:text-[#e4e6eb] truncate">
                                  {user.first_name} {user.last_name}
                                </span>
                                {user.id === currentUserId && (
                                  <span className="text-xs text-[#65676b] dark:text-[#b0b3b8]">Nhấp để gỡ</span>
                                )}
                              </div>
                            </div>
                            <span className="text-lg">{emoji}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && (
        <ForwardFriendsModal
          visible={showForwardModal}
          onSelect={(friendId) => {
            if (!forwardMessageId) return;
            const socket = (window as any).chatSocket;
            socket?.emit('forwardMessage', {
              originalMessageId: forwardMessageId,
              newReceiverId: friendId,
            });
            toast.success('Đã chuyển tiếp tin nhắn.');
            setShowForwardModal(false);
            setForwardMessageId(null);
          }}
          onClose={() => {
            setShowForwardModal(false);
            setForwardMessageId(null);
          }}
        />
      )}
      {isBlocked ? (
        <div className="text-center text-gray-500 dark:text-white p-4">
          {blockedBy === currentUserId ? (
            <>
              <p>Bạn đã chặn người này. Không thể gửi tin nhắn.</p>
              <button
                onClick={handleUnblock}
                className="mt-2 px-4 py-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300"
              >
                Bỏ chặn
              </button>
            </>
          ) : (
            <p>Bạn đã bị chặn. Không thể gửi tin nhắn.</p>
          )}
        </div>
      ) : (
        <MessageInput
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          handleInputKeyDown={handleInputKeyDown}
          disabled={!input.trim()}
        />
      )}
    </div>
  );
}