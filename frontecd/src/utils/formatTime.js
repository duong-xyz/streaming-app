export const formatTime = (dateString) => {
  if (!dateString || dateString === "Vừa xong") return "Vừa xong";
  
  let formattedString = dateString;

  // Nếu chuỗi thời gian từ server là dạng ISO (có chữ T) nhưng thiếu Z ở cuối
  if (typeof dateString === 'string' && dateString.includes('T') && !dateString.endsWith('Z')) {
    formattedString = `${dateString}Z`; // Bù chữ Z để ép trình duyệt đọc đúng múi giờ UTC
  }

  const past = new Date(formattedString);
  if (isNaN(past.getTime())) return "Vừa xong";

  const nowUtc = Date.now(); 
  const pastUtc = past.getTime(); 
  const diffInSeconds = Math.floor((nowUtc - pastUtc) / 1000);

  // Hệ thống hiển thị thời gian Facebook
  if (diffInSeconds < 60) return "Vừa xong";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  
  return past.toLocaleDateString('vi-VN');
};

export const formatTimeTest = (dateString) => {
    console.log('log date: ',dateString);
    
    if (!dateString || dateString === "Vừa xong") return "Vừa xong";

    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    return past.toLocaleDateString('vi-VN');
};