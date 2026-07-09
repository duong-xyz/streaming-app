import { useState, useCallback, useMemo } from 'react';
import commentService from '../services/commentService';

export function useComments(episodeId, userId) {
    const [state, setState] = useState({
        list: [],
        page: 0,
        totalPages: 0,
        inputRoot: '',
        activeReplyId: null,
        isLoading: true,
        isSubmitting: false // Khóa chống trùng lặp submit
    });

    const fetchComments = useCallback(async (pageNumber) => {
        try {
            if (pageNumber === 0) setState((prev) => ({ ...prev, isLoading: true }));
            const data = await commentService.getCommentsByEpisode(episodeId, pageNumber, 10);
            setState((prev) => ({
                ...prev,
                list: pageNumber === 0 ? data.content : [...prev.list, ...data.content],
                totalPages: data.totalPages,
                page: pageNumber,
                isLoading: false
            }));
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, [episodeId]);

    const setInputRoot = useCallback((text) => {
        setState((prev) => ({ ...prev, inputRoot: text }));
    }, []);

    // Đăng bình luận gốc (Cấp 1) - CHỐNG LẶP TIN & CHỊU LỖI CAO
    const handleCreateComment = useCallback(async (e) => {
        if (e) e.preventDefault(); // Chặn hành vi gửi form trùng lặp

        // 1. Lấy và chuẩn hóa chuỗi dữ liệu ngay tại nhịp bấm máy
        const textToSend = state.inputRoot.trim();

        // LỚP BẢO VỆ: Nếu ô nhập trống hoặc hệ thống đang bận gửi bài, thoát ngay lập tức
        if (!textToSend || state.isSubmitting) return;

        // 2. Khóa cứng UI và xóa trống ô nhập liệu lập tức để tạo cảm giác mượt mà (Instant UI)
        setState((prev) => ({ ...prev, inputRoot: '', isSubmitting: true }));

        try {
            // 3. Gửi API với dữ liệu chuỗi textToSend chắc chắn có chữ
            const created = await commentService.createComment(episodeId, {
                content: textToSend,
                parentId: null
            });

            // 4. Đẩy bản ghi thực tế từ server vào mảng hiển thị
            setState((prev) => ({
                ...prev,
                list: [created, ...prev.list]
            }));
        } catch (error) {
            console.error("Lỗi tải bình luận:", error);

            // HOÀN TÁC CHỮ: Nếu sập mạng hoặc lỗi token, trả lại chữ vào ô nhập cho người dùng
            setState((prev) => ({
                ...prev,
                inputRoot: textToSend
            }));
        } finally {
            // LUÔN LUÔN CHẠY: Hạ cờ để tắt vòng xoay Loading, giải phóng nút bấm
            setState((prev) => ({ ...prev, isSubmitting: false }));
        }
    }, [episodeId, state.inputRoot, state.isSubmitting]);

    // Tạo phản hồi (Cấp 2) - CHỐNG LẶP TIN
    const handleCreateReply = useCallback(async (parentId, textContent) => {
        const textToSend = (textContent || '').trim();
        let currentlySubmitting = false;

        // Đọc trạng thái submits mới nhất từ bộ nhớ cache của state
        setState((prev) => {
            currentlySubmitting = prev.isSubmitting;
            return prev;
        });
        // Lớp bảo vệ: Nếu nội dung phản hồi trống hoặc hệ thống đang bận gửi tin thì chặn lại ngay
        if (!textToSend || currentlySubmitting) return;

        // Bước 1: Bật cờ khóa UI tổng để hiển thị biểu tượng Loading xoay tròn ở nút gửi bài
        setState((prev) => ({ ...prev, isSubmitting: true }));

        try {
            // Bước 2: Chờ API phản hồi dữ liệu lồng tầng
            const created = await commentService.createComment(episodeId, {
                content: textToSend,
                parentId: parentId // Gắn ID cha để ép Backend hiểu đây là câu trả lời cấp 2
            });

            // Bước 3: Định vị chính xác phần tử cha và đẩy dữ liệu vào mảng replies con của nó
            setState((prev) => ({
                ...prev,
                activeReplyId: null, // Đóng khung nhập phản hồi ngay sau khi gửi thành công
                list: prev.list.map((c) =>
                    c.id === parentId ? { ...c, replies: [created, ...(c.replies || [])] } : c
                )
            }));
        } catch (error) {
            console.error("Lỗi đăng bình luận cấp 2:", error);

            const isTokenExpired = error.response?.data?.message?.includes("Token không hợp lệ hoặc đã hết hạn");
            if (!isTokenExpired) {
                alert("Lỗi khi gửi phản hồi cấp 2. Vui lòng thử lại!");
            }

            // Lưu ý: Đối với cấp 2, text nằm trong state local của từng CommentItem 
            // nên ta không cần hoàn tác chữ tại hook này (Component con tự giữ chữ khi submit thất bại).
        } finally {
            // LUÔN LUÔN CHẠY: Tắt vòng xoay Loading, ngăn chặn lỗi "loading mãi mãi" triệt để cho tầng phản hồi
            setState((prev) => ({ ...prev, isSubmitting: false }));
        }
    }, [episodeId]);


    const handleToggleReply = useCallback((commentId) => {
        setState((prev) => ({ ...prev, activeReplyId: prev.activeReplyId === commentId ? null : commentId }));
    }, []);

    const handleDelete = useCallback(async (commentId, parentId = null) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn mục này?")) return;
        try {
            await commentService.deleteComment(commentId, userId);
            setState((prev) => ({
                ...prev,
                list: parentId
                    ? prev.list.map((c) => c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) } : c)
                    : prev.list.filter((c) => c.id !== commentId)
            }));
        } catch (error) {
            alert("Hành động không hợp lệ.");
        }
    }, [userId]);

    const hasMorePage = useMemo(() => state.page + 1 < state.totalPages, [state.page, state.totalPages]);

    return {
        state,
        hasMorePage,
        fetchComments,
        setInputRoot,
        handleCreateComment,
        handleCreateReply,
        handleToggleReply,
        handleDelete
    };
}
