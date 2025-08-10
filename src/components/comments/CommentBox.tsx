'use client';

import { useEffect, useRef, useState } from 'react';
import { commentService } from '@/services/commentService';
import CommentItem from './CommentItem';
import { useUserStore } from '@/stores/userStore';
import Link from 'next/link';
import { notificationService } from '@/services/notificationService';
import TextareaAutosize from 'react-textarea-autosize';
import { useEmojiPicker } from '@/hooks/useEmojiPicker';
import { Laugh, SendHorizontal } from 'lucide-react';
import EmojiPickerComponent from '../common/ui/EmojiPickerComponent';
import { useCommentSocket } from '@/hooks/useCommentSocket';

export default function CommentBox({
    postId,
    postOwnerId,
    fullNamePostOwner
}: {
    postId: number;
    postOwnerId: number;
    fullNamePostOwner: string;
}) {
    const currentUser = useUserStore(state => state.user);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null!);

    const { showEmojiPicker, setShowEmojiPicker, emojiPickerRef, handleEmojiSelect } =
        useEmojiPicker(
            (emoji: string) => setNewComment(prev => prev + emoji),
            buttonRef
        );

    function updateReactions(commentsList: any[], commentId: number, reaction: any): any[] {
        if (!reaction || (!reaction.user && reaction.message === 'Reaction removed')) {
            return commentsList;
        }

        if (!reaction.user || !reaction.user.id) {
            return commentsList;
        }

        return commentsList.map(c => {
            if (c.id === commentId) {
                let reactions = c.reactions ? [...c.reactions] : [];

                if (reaction.type === null) {
                    reactions = reactions.filter(r => r.user && r.user.id !== reaction.user.id);
                } else {
                    const index = reactions.findIndex(r => r.user && r.user.id === reaction.user.id);
                    if (index >= 0) {
                        reactions = [
                            ...reactions.slice(0, index),
                            reaction,
                            ...reactions.slice(index + 1),
                        ];
                    } else {
                        reactions = [...reactions, reaction];
                    }
                }
                return { ...c, reactions };
            } else if (c.replies && c.replies.length > 0) {
                return { ...c, replies: updateReactions(c.replies, commentId, reaction) };
            }
            return c;
        });
    }



    const fetchComments = async () => {
        const res = await commentService.getCommentsByPost(postId);
        if (res) setComments(res);
    };

    const { createComment, deleteComment, reactComment } = useCommentSocket({
        postId,
        onNewComment: (comment) => {
            setComments(prev => {
                if (!comment.parent) {
                    return [comment, ...prev];
                } else {
                    let found = false;
                    const newComments = prev.map(c => {
                        if (c.id === comment.parent) {
                            found = true;
                            return {
                                ...c,
                                replies: [...(c.replies || []), comment],
                            };
                        }
                        return c;
                    });
                    if (!found) {
                        fetchComments();
                        return prev;
                    }
                    return newComments;
                }
            });
        },
        onCommentUpdated: updated => {
            setComments(prev =>
                prev.map(c => (c.id === updated.id ? updated : c))
            );
        },
        onCommentDeleted: commentId => {
            setComments(prev => prev.filter(c => c.id !== commentId));
        },
        onCommentReaction: ({ commentId, reaction }) => {
            setComments(prev => {
                const updated = updateReactions(prev, commentId, reaction);
                return updated;
            });
        }
    });

    if (!currentUser) {
        return null;
    }

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleReply = (parentId: number, content: string) => {
        if (!content.trim()) return;

        const newReply = {
            id: Math.random(),
            content,
            user: currentUser,
            parent: parentId,
            replies: [],
            reactions: [],
            created_at: new Date().toISOString(),
        };

        setComments(prev =>
            prev.map(c => {
                if (c.id === parentId) {
                    return {
                        ...c,
                        replies: [...(c.replies || []), newReply],
                    };
                }
                return c;
            })
        );

        createComment({ content, userId: currentUser.id, parentId } as any);

        if (currentUser.id !== postOwnerId) {
            notificationService.sendNotification(
                postOwnerId,
                `${currentUser.first_name} ${currentUser.last_name} đã trả lời bình luận về bài viết của bạn`,
                `/bai-viet/${postId}`,
                `${currentUser.avatar_url}`
            );
        }
    };

    const handleNewComment = () => {
        if (!newComment.trim()) return;

        createComment({ content: newComment, userId: currentUser.id });

        if (currentUser.id !== postOwnerId) {
            notificationService.sendNotification(
                postOwnerId,
                `${currentUser.first_name} ${currentUser.last_name} đã bình luận về bài viết của bạn`,
                `/bai-viet/${postId}`,
                `${currentUser.avatar_url}`
            );
        }

        setNewComment('');
        setShowEmojiPicker(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNewComment();
        }
    };

    const topLevelComments = comments.filter(c => c.parent === null);

    return (
        <div className="mt-4">
            <div className="flex items-center py-4 px-4 rounded-xl bg-white dark:bg-dark-card gap-2 mb-4 relative">
                <Link href={`/trang-ca-nhan/${currentUser.id}`}>
                    <img
                        src={currentUser?.avatar_url || '/default-avatar.png'}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover"
                    />
                </Link>
                <TextareaAutosize
                    value={newComment}
                    ref={textareaRef}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Viết bình luận công khai..."
                    minRows={1}
                    maxRows={3}
                    className="flex-1 bg-gray-100 dark:bg-[#333] rounded-xl px-4 py-2 text-sm dark:text-white focus:outline-none resize-none overflow-y-auto"
                />
                <button
                    ref={buttonRef}
                    onClick={() => setShowEmojiPicker(prev => !prev)}
                    className="text-[#65676b] dark:text-[#b0b3b8] hover:text-[#0084ff] "
                >
                    <Laugh size={20} />
                </button>
                <EmojiPickerComponent
                    show={showEmojiPicker}
                    onEmojiSelect={handleEmojiSelect}
                    emojiPickerRef={emojiPickerRef}
                />
                <button
                    onClick={handleNewComment}
                    className=" py-2 hover:text-blue-600"
                    disabled={!newComment.trim()}
                >
                    <SendHorizontal size={20} />
                </button>
            </div>

            <div className="space-y-4">
                {topLevelComments.map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUserId={currentUser.id}
                        postId={postId}
                        cmtOwnerId={comment.user.id}
                        onReply={handleReply}
                        postOwnerId={postOwnerId}
                        fullNamePostOwner={fullNamePostOwner}
                        onDelete={async commentId => {
                            deleteComment(commentId);
                        }}
                        parentIdOfParent={comment.id}
                        reactComment={reactComment}
                    />
                ))}
            </div>
        </div>
    );
}
