import React, { useState, useEffect, useRef } from 'react';

export default function TimePicker24h({ value, onChange, size = 'md' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const hourRefs = useRef({});
  const minuteRefs = useRef({});

  // Đọc giá trị hiện tại (Đảm bảo đồng bộ ngay lập tức lên UI chính)
  const [hours, minutes] = value && value.includes(':') ? value.split(':') : ['18', '00'];

  // Cấu hình tỉ lệ size linh hoạt
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 text-xs rounded',
      popover: 'mt-1 p-1 h-44 rounded-md',
      item: 'py-1 text-xs rounded',
      title: 'text-[9px] py-0.5'
    },
    md: {
      button: 'px-2.5 py-1.5 text-sm rounded-md',
      popover: 'mt-1.5 p-1.5 h-56 rounded-lg',
      item: 'py-1.5 text-sm rounded-md',
      title: 'text-[10px] py-1'
    },
    lg: {
      button: 'px-3.5 py-2 text-base rounded-lg',
      popover: 'mt-2 p-2 h-64 rounded-xl',
      item: 'py-2 text-base rounded-lg',
      title: 'text-[11px] py-1'
    }
  }[size] || sizeClasses.md;

  const hoursArray = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesArray = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // Tự động cuộn đến vị trí đang chọn khi mở dropdown
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        hourRefs.current[hours]?.scrollIntoView({ block: 'center', behavior: 'auto' });
        minuteRefs.current[minutes]?.scrollIntoView({ block: 'center', behavior: 'auto' });
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hours, minutes]);

  // Đóng dropdown khi click ra ngoài vùng chọn
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý cập nhật giá trị tức thì khi click từng cột
  const handleSelectHour = (newHour) => {
    onChange(`${newHour}:${minutes}`);
  };

  const handleSelectMinute = (newMinute) => {
    onChange(`${hours}:${newMinute}`);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Ô hiển thị thời gian chính (Luôn hiển thị đúng giá trị đang chọn) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border border-slate-200 font-medium text-slate-700 outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all flex justify-between items-center select-none shadow-sm hover:bg-slate-50 ${sizeClasses.button}`}
      >
        <span className={value ? 'text-slate-900' : 'text-slate-400'}>
          {value || 'Chọn giờ chiếu...'}
        </span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-600' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Menu Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 left-0 right-0 bg-white border border-slate-100 shadow-xl flex gap-1 animate-in fade-in slide-in-from-top-1 duration-150 ${sizeClasses.popover}`}>
          
          {/* Cột chọn Giờ */}
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth flex flex-col gap-0.5 px-0.5">
            <div className={`uppercase font-bold text-slate-400 text-center sticky top-0 bg-white z-10 ${sizeClasses.title}`}>Giờ</div>
            {hoursArray.map((h) => (
              <button
                key={h}
                type="button"
                ref={(el) => (hourRefs.current[h] = el)}
                onClick={() => handleSelectHour(h)}
                className={`w-full transition-colors text-center font-medium ${sizeClasses.item} ${
                  h === hours 
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold' 
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          {/* Đường ngăn cách mờ */}
          <div className="w-[1px] bg-slate-100 my-2"></div>

          {/* Cột chọn Phút */}
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth flex flex-col gap-0.5 px-0.5">
            <div className={`uppercase font-bold text-slate-400 text-center sticky top-0 bg-white z-10 ${sizeClasses.title}`}>Phút</div>
            {minutesArray.map((m) => (
              <button
                key={m}
                type="button"
                ref={(el) => (minuteRefs.current[m] = el)}
                onClick={() => handleSelectMinute(m)}
                className={`w-full transition-colors text-center font-medium ${sizeClasses.item} ${
                  m === minutes 
                    ? 'bg-cyan-600 text-white shadow-sm font-semibold' 
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* Ẩn thanh cuộn mặc định của trình duyệt */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
