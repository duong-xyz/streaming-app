import React from 'react';
import { HeartOutlined, CommentOutlined } from '@ant-design/icons';

const MovieInfoSidebar = ({ detail, activeQuality }) => {
    return (
        <div className="order-3 lg:order-none lg:col-span-1 bg-[#1a1c23] border border-zinc-800 rounded-lg p-5 flex flex-col gap-4">
            <div>
                <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">{detail?.title}</h1>
                {detail?.alternativeTitle && (
                    <p className="text-xs text-zinc-400 italic mt-1">Tên khác: {detail.alternativeTitle}</p>
                )}
            </div>

            {/* Chi tiết thông số */}
            <div className="text-xs text-zinc-300 flex flex-col gap-2 border-b border-zinc-800 pb-4">
                <div className="flex justify-between">
                    <span className="text-zinc-400">Lịch chiếu:</span>
                    <span className="text-orange-400 font-medium">{detail?.schedule || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-400">Trạng thái:</span>
                    <span className="text-emerald-400 font-semibold">{detail?.status?.displayName || 'Đang tiến hành'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-400">Lượt xem:</span>
                    <span className="font-mono text-cyan-400">{detail?.viewsTotal?.toLocaleString('vi-VN') || 0}</span>
                </div>
                {activeQuality && (
                    <div className="flex justify-between">
                        <span className="text-zinc-400">Độ phân giải:</span>
                        <span className="font-mono text-emerald-400">{activeQuality.quality}</span>
                    </div>
                )}
            </div>

            {/* Thể loại */}
            <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Thể loại hoạt hình:</h4>
                <div className="flex flex-wrap gap-1.5">
                    {/* Thay thế AntD Tag bằng thẻ span kết hợp bo tròn full và kích thước chữ đồng điệu */}
                    <span className="bg-[#222531] text-zinc-300 border border-zinc-800 rounded-full text-[11px] px-3 py-0.5 font-medium select-none">CN Animation</span>
                    <span className="bg-[#222531] text-zinc-300 border border-zinc-800 rounded-full text-[11px] px-3 py-0.5 font-medium select-none">Huyền Huyễn</span>
                    <span className="bg-[#222531] text-zinc-300 border border-zinc-800 rounded-full text-[11px] px-3 py-0.5 font-medium select-none">Tiên Hiệp</span>
                </div>
            </div>

            {/* Tương tác */}
            <div className="mt-2 flex flex-col gap-2.5">
                {/* NÚT primary block: Chuyển sang button HTML thuần kèm hiệu ứng nhấn nhẹ mượt mà */}
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold h-9 rounded-lg transition-all active:scale-[0.99] text-xs md:text-sm cursor-pointer border-none"
                >
                    <HeartOutlined className="text-sm" />
                    <span>Thêm vào Phim Yêu Thích</span>
                </button>

                {/* NÚT block phụ: Thay thế nút rỗng của AntD, căn đều trung tâm */}
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 bg-[#222531] text-zinc-200 border border-zinc-800 hover:text-cyan-400 hover:border-cyan-500/40 h-9 rounded-lg transition-all active:scale-[0.99] text-xs md:text-sm cursor-pointer"
                >
                    <CommentOutlined className="text-sm" />
                    <span>Xem bình luận độc giả</span>
                </button>
            </div>

            {/* Mô tả cốt truyện */}
            {detail?.description && (
                <div className="mt-2 border-t border-zinc-800 pt-4">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-1.5">Nội dung tóm tắt:</h4>
                    <p
                        onClick={(e) => {
                            // Chỉ xử lý đóng/mở trên màn hình Desktop (Màn hình lớn >= 1024px)
                            if (window.innerWidth >= 1024) {
                                const p = e.currentTarget;
                                // Đảo trạng thái chuỗi "true"/"false" của thuộc tính data-open trên DOM thô
                                const isExpanded = p.getAttribute('data-open') === 'true';
                                p.setAttribute('data-open', isExpanded ? 'false' : 'true');
                                // Đồng bộ thay đổi thuộc tính title hover tương ứng
                                p.title = isExpanded ? "Xem thêm" : "Thu gọn";
                            }
                        }}
                        // Gán giá trị trạng thái tĩnh ban đầu cho DOM
                        data-open="false"
                        // MẶC ĐỊNH: Hiện hết trên Mobile. Lên máy tính (lg:) mới ép về 5 dòng
                        // Dùng thuộc tính data-open của Tailwind v4 để điều khiển nhả dòng: data-open="true" sẽ hủy line-clamp
                        className="text-xs text-zinc-400 leading-relaxed lg:line-clamp-5 data-[open=true]:lg:line-clamp-none select-none lg:cursor-pointer transition-all duration-200 outline-none"
                        title="Xem thêm" // Tiêu đề hover mặc định ban đầu
                    >
                        {detail.description}
                    </p>
                </div>
            )}
        </div>
    );
};

// Bọc React.memo để bảo vệ bộ nhớ giao diện
export default React.memo(MovieInfoSidebar);
