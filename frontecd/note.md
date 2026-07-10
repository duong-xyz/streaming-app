npm run dev -- --host

export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  }
})


The element has a fixed position. Automatically set up a new display layer (Stacking Context).

<style>{`
            .plyr-dark-theme { --plyr-color-main: #06b6d4; }
            .plyr__video-wrapper { background-color: #000 !important; }
            
            /* ÉP BUỘC TRÌNH PHÁT PLYR LUÔN CHIẾM TRỌN 100% CHIỀU CAO KHUNG HÌNH 16:9 */
            .plyr { 
                width: 100% !important; 
                height: 100% !important; 
            }

            /* ĐẢM BẢO KHUNG CHỨA NỘI BỘ CỦA PLYR KHÔNG BỊ CO VỀ 0PX KHI ĐANG LOADING */
            .plyr__plyr {
                height: 100% !important;
            }
        `}</style>




{/* ================= KHU VỰC GIỮA: Ô TÌM KIẾM DESKTOP ================= */}
            <div className='hidden md:block w-80 max-w-xs group'>
                {/* Khung bọc mô phỏng chính xác cấu trúc affixWrapper và các sự kiện hover/focus của AntD */}
                <div className="relative flex items-center bg-[#1f2937] border border-[#374151] rounded-full px-4 py-2 transition-all duration-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20">
                    <SearchOutlined className="text-white group-hover:text-cyan-400 cursor-pointer transition-colors text-base mr-2" />
                    <input
                        type='text'
                        placeholder='Tìm kiếm...'
                        className="w-full bg-transparent text-white placeholder:text-gray-400 text-sm outline-none border-none"
                    />
                </div>
            </div>

Để thực hiện đúng cam kết nâng cấp chuẩn phong vị HalimThemes / hoathinh3d.st giống như các component trước, bảng xếp hạng sẽ được bọc dải viền mờ, tích hợp hệ màu Ngọc Bích Jade dịu mát kết hợp Vàng Gold rực sáng, loại bỏ hoàn toàn tone xám lạnh và xanh cyan thô cũ.