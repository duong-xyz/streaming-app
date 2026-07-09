import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useComments } from '../hooks/useComments';
import CommentItem from '../components/CommentItem';
import { EditFilled } from '@ant-design/icons';

const SkeletonList = () => {
  return (
    <div className="space-y-4 animate-pulse mt-4">
      {[1, 2].map((n) => (
        <div key={n} className="flex gap-3 items-start">
          <div className="w-9 h-9 bg-zinc-700 rounded-full shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="bg-zinc-700 h-12 rounded-2xl w-2/3"></div>
            <div className="h-3 bg-zinc-700 rounded w-20 ml-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CommentSection = ({ episodeId }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const {
    state,
    hasMorePage,
    fetchComments,
    setInputRoot,
    handleCreateComment,
    handleCreateReply,
    handleToggleReply,
    handleDelete
  } = useComments(episodeId, user?.id);

  useEffect(() => {
    if (episodeId) {
      fetchComments(0);
    }
  }, [episodeId, fetchComments]);

  return (
    <div className="bg-[#1a1c23] text-zinc-100 p-6 rounded-xl mt-4 border border-zinc-800 w-full mx-auto shadow-sm min-h-[300px]">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <h3 className="text-md font-bold text-zinc-300">Tất cả bình luận</h3>
        <span className="text-sm text-zinc-500 font-medium">Phù hợp nhất</span>
      </div>

      {/* Root Primary Comment Input Box */}
      {isAuthenticated ? (
        <div className="flex gap-3 items-start mb-6">
          <img
            src={user?.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAmBZxQBCd28UlxhhW6MezL-CuP5oBJ-oWXvRHPh2P1A&s=10'}
            alt="Me"
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <form onSubmit={handleCreateComment} className="flex-1 relative">
            <textarea
              value={state.inputRoot}
              onChange={(e) => setInputRoot(e.target.value)}
              placeholder="Viết bình luận công khai..."
              rows={1}
              disabled={state.isSubmitting} // Khóa ô nhập khi đang gửi
              className="w-full bg-zinc-800 text-zinc-100 p-3 pr-14 rounded-2xl border-none focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none min-h-[40px] max-h-[120px] overflow-y-auto disabled:opacity-70"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!state.isSubmitting) {
                    e.currentTarget.form.requestSubmit();
                  }
                }
              }}
            />

            {/* Khối nút bấm tích hợp Loading Spinner kiểu Facebook */}
            <button
              type="submit"
              disabled={state.isSubmitting}
              className={`absolute right-3 top-2.5 font-semibold text-xs tracking-wide cursor-pointer transition-all flex items-center justify-center min-w-[36px] min-h-[24px] ${state.isSubmitting
                ? 'text-zinc-400 cursor-not-allowed'
                : 'text-cyan-400 hover:text-cyan-700'
                }`}
            >
              {state.isSubmitting ? (
                /* Icon Loading xoay tròn bằng SVG thuần của Tailwind CSS */
                <svg className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Đăng'
              )}
            </button>
          </form>

        </div>
      ) : (
        <div className='flex items-center justify-center'>
          <a href="/login" className="flex gap-1 bg-cyan-500 text-[#1a1c23] px-4 mb-6 rounded-xl py-2 font-bold text-center text-sm hover:bg-cyan-400 border border-zinc-800">
          <EditFilled />Đăng nhập để bình luận</a>
        </div>
      )}

      {/* Primary Tree List View Section */}
      <div className="space-y-4">
        {state.isLoading ? (
          <SkeletonList />
        ) : isAuthenticated && state.list.length === 0 ? (
          <div className="text-center text-zinc-400 text-sm py-8 font-medium">Chưa có bình luận nào ở đây.</div>
        ) : (
          state.list.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              isAuthenticated={isAuthenticated}
              activeReplyId={state.activeReplyId}
              onToggleReply={handleToggleReply}
              onDelete={handleDelete}
              onCreateReply={handleCreateReply}
              isSubmitting={state.isSubmitting}
            />
          ))
        )}
      </div>

      {/* Facebook Style Pagination Triggers */}
      {hasMorePage && !state.isLoading && (
        <div className="mt-4 ml-12">
          <button
            onClick={() => fetchComments(state.page + 1)}
            className="text-xs font-bold text-zinc-400 hover:underline cursor-pointer"
          >
            Xem thêm bình luận...
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
