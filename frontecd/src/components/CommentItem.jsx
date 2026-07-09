import React, { useState, memo } from 'react';
import { formatTime } from '../utils/formatTime'

// Sub-component hiển thị mảng phản hồi cấp 2 độc lập
const FacebookReplyList = memo(({ replies, currentUserId, commentId, onDelete }) => {
    return (
        <div className="ml-11 mt-2 space-y-3 border-l-2 border-zinc-200 dark:border-zinc-700 pl-3 animate-fade-in">
            {replies.map((reply) => (
                <div key={reply.id} className="flex gap-2 items-start text-sm group">
                    <img
                        src={reply.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAmBZxQBCd28UlxhhW6MezL-CuP5oBJ-oWXvRHPh2P1A&s=10'}
                        alt={reply.username}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-2xl inline-block max-w-full relative pr-8">
                            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block hover:underline cursor-pointer">
                                {reply.username}
                            </span>
                            <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-0.5 whitespace-pre-wrap break-words">
                                {reply.content}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-zinc-500 font-semibold">
                            <button className="hover:underline cursor-pointer">Thích</button>
                            <span className="text-zinc-400 font-normal">
                                {formatTime(reply.createdAt)}
                            </span>
                            {currentUserId === reply.userId && (
                                <>
                                    <button
                                        onClick={() => onDelete(reply.id, commentId)}
                                        className="text-zinc-400 hover:text-red-500 cursor-pointer font-normal opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Xóa
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

const CommentItem = memo(({
    comment,
    currentUserId,
    isAuthenticated,
    activeReplyId,
    onToggleReply,
    onDelete,
    onCreateReply,
    isSubmitting
}) => {
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(false); // State ẩn/hiện danh sách phản hồi

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onCreateReply(comment.id, replyText);
        setReplyText('');
        setShowReplies(true); // Tự động mở rộng danh sách khi viết reply mới
    };

    const isParentOwner = currentUserId === comment.userId;
    const isReplyingThis = activeReplyId === comment.id;
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div className="group/parent">
            <div className="flex gap-3 items-start text-sm">
                <img
                    src={comment.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAmBZxQBCd28UlxhhW6MezL-CuP5oBJ-oWXvRHPh2P1A&s=10'}
                    alt={comment.username}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                />

                <div className="flex-1 min-w-0">
                    <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-2xl inline-block max-w-full">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 block hover:underline cursor-pointer">
                            {comment.username}
                        </span>
                        <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-0.5 whitespace-pre-wrap break-words">
                            {comment.content}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-zinc-500 font-bold">
                        <button className="hover:underline cursor-pointer text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">Thích</button>
                        {isAuthenticated && (
                            <>
                                <button
                                    onClick={() => onToggleReply(comment.id)}
                                    className="hover:underline cursor-pointer text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                >
                                    Phản hồi
                                </button>
                            </>
                        )}
                        <span className="text-zinc-400 font-normal">
                            {formatTime(comment.createdAt)}
                        </span>
                        {isParentOwner && (
                            <>
                                <button
                                    onClick={() => onDelete(comment.id)}
                                    className="text-zinc-400 hover:text-red-500 cursor-pointer font-normal opacity-0 group-hover/parent:opacity-100 transition-opacity"
                                >
                                    Xóa
                                </button>
                            </>
                        )}
                    </div>

                    {isReplyingThis && (
                        <form onSubmit={handleReplySubmit} className="mt-2 ml-2 flex gap-2 max-w-md items-center animate-fade-in">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={isSubmitting} // Sử dụng biến sạch từ Prop bóc tách
                                placeholder={`Phản hồi công khai bằng tên của bạn...`}
                                className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-none disabled:opacity-70"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-bold px-2 py-1 cursor-pointer min-w-[32px] flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <svg className="animate-spin h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    'Gửi'
                                )}
                            </button>
                        </form>
                    )}


                    {/* Thanh công cụ Ẩn/Hiện phản hồi kiểu Facebook */}
                    {hasReplies && (
                        <div className="mt-2 ml-2">
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:underline cursor-pointer"
                            >
                                {/* Biểu tượng mũi tên phản hồi góc cong */}
                                <svg className={`w-3.5 h-3.5 transform transition-transform ${showReplies ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                                {showReplies ? 'Ẩn các phản hồi' : `Xem tất cả ${comment.replies.length} phản hồi`}
                            </button>
                        </div>
                    )}

                    {/* Khối hiển thị có điều kiện đi kèm đóng mở */}
                    {hasReplies && showReplies && (
                        <FacebookReplyList
                            replies={comment.replies}
                            currentUserId={currentUserId}
                            commentId={comment.id}
                            onDelete={onDelete}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.comment === nextProps.comment &&
        prevProps.activeReplyId === nextProps.activeReplyId &&
        prevProps.isAuthenticated === nextProps.isAuthenticated &&
        prevProps.currentUserId === nextProps.currentUserId &&
        prevProps.isSubmitting === nextProps.isSubmitting
    );
});

export default CommentItem;
