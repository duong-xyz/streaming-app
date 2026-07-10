import React from 'react';

export default function LoadingHH3D({ loading = true }) {
  if (!loading) return null;

  return (
    /* EXPERT UPDATE: Ép cứng id, gán z-index tối cao 99999, nền đen mực rgba(8,5,18,.75) và độ mờ kính 6px chuẩn đặc tả CSS gốc */
    <div 
      id="lc-sched-loading"
      role="status" 
      aria-live="polite" 
      aria-busy="true"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-6 bg-[rgba(8,5,18,0.75)] backdrop-filter backdrop-blur-[6px] -webkit-backdrop-filter overflow-hidden select-none animate-in fade-in duration-300"
    >
      
      {/* Hiệu ứng hào quang (Aura) ma mị phía sau trận pháp - Sử dụng dải phát quang đặc hiệu --lc-glow-gold */}
      <div className="absolute w-72 h-72 bg-[rgba(232,200,114,0.08)] rounded-full blur-3xl animate-[pulse_4s_infinite_ease-in-out]" />

      {/* Vùng chứa chính của Trận Pháp Loading (.lc-loader-ring) */}
      <div className="relative flex items-center justify-center w-48 h-48 select-none">
        
        {/* Vòng ngoài: Cổ trận pháp nét đứt xoay chậm quay ngược chiều kim đồng hồ */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#e8c872]/20 animate-[spin_12s_linear_infinite_reverse]" />
        
        {/* Vòng năng lượng chính: Xoay nhanh, đổ màu Gradient vàng kim phát sáng chuẩn màu gốc --lc-gold */}
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#e8c872] border-r-[#b8943f]/60 animate-[spin_1.5s_linear_infinite] shadow-[0_0_24px_rgba(232,200,114,0.25)]" />
        
        {/* Vòng sóng xung kích tâm điểm: Co giãn theo nhịp thở của linh lực */}
        <div className="absolute inset-4 rounded-full border border-[#e8c872]/15 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        
        {/* Khối lõi chứa thần thức HH3D (.lc-loader-dot) */}
        <div className="absolute inset-6 bg-[rgba(20,14,36,0.92)] rounded-full border border-[rgba(232,200,114,0.22)] backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_15px_rgba(232,200,114,0.2)]">
          
          {/* Chữ HH3D: Hiệu ứng text đổ bóng Cinema & Phát sáng huyền huyễn chuẩn dải màu hổ phách vàng Gold */}
          <span className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#f0e4c8] via-[#e8c872] to-[#b8943f] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] [filter:drop-shadow(0_0_10px_rgba(232,200,114,0.5))] font-serif italic">
            HH3D
          </span>
          
        </div>
        
        {/* Linh thạch nhỏ chạy bo viền tăng tính bất đối xứng tinh tế */}
        {/* <div className="absolute top-1 left-1/2 w-2 h-2 bg-[#f0e4c8] rounded-full animate-[spin_1.5s_linear_infinite] origin-[0_92px] shadow-[0_0_10px_rgba(232,200,114,0.6)]" /> */}
      </div>

      {/* EXPERT UI BỔ SUNG: Dòng chữ .lc-loader-text "Đang tải..." chuyển động tịnh tiến nhấp nháy đuổi nhau */}
      <div className="flex items-center gap-0.5 text-xs font-bold tracking-[3px] text-[#c4b896] uppercase select-none mt-2">
        <span>Đang tải</span>
        <span className="animate-pulse duration-700">.</span>
        <span className="animate-pulse duration-700 delay-150">.</span>
        <span className="animate-pulse duration-700 delay-300">.</span>
      </div>
      
    </div>
  );
}
