import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const COMMENT_NAMESPACE = '/comment';

interface UseCommentSocketProps {
  postId: number;
  onNewComment?: (comment: any) => void;
  onCommentUpdated?: (comment: any) => void;
  onCommentDeleted?: (commentId: number) => void;
  onCommentReaction?: (data: { commentId: number; reaction: any }) => void;
}

export function useCommentSocket({
  postId,
  onNewComment,
  onCommentUpdated,
  onCommentDeleted,
  onCommentReaction
}: UseCommentSocketProps) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Kết nối tới namespace /comment
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL + COMMENT_NAMESPACE, {
      transports: ['websocket']
    });
    socketRef.current = socket;

    // Tham gia room post
    socket.emit('joinPost', postId);

    // Lắng nghe sự kiện từ server
    if (onNewComment) socket.on('newComment', onNewComment);
    if (onCommentUpdated) socket.on('commentUpdated', onCommentUpdated);
    if (onCommentDeleted) socket.on('commentDeleted', onCommentDeleted);
    if (onCommentReaction) socket.on('commentReaction', onCommentReaction);

    return () => {
      socket.disconnect();
    };
  }, [postId]);

  // Các hàm gửi sự kiện
  const createComment = (data: { content: string; userId: number }) => {
    socketRef.current?.emit('createComment', {
      ...data,
      postId
    });
  };

  const updateComment = (id: number, dto: { content: string }) => {
    socketRef.current?.emit('updateComment', { id, dto });
  };

  const deleteComment = (id: number) => {
    socketRef.current?.emit('deleteComment', id);
  };

  const reactComment = (commentId: number, userId: number, type: string | null) => {
    socketRef.current?.emit('reactComment', { commentId, userId, type });
  };

  return {
    createComment,
    updateComment,
    deleteComment,
    reactComment
  };
}
