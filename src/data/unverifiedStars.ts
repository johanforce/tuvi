/**
 * Danh mục sao chưa kiểm chứng hoặc đang ở trạng thái ứng viên (Candidate / Conflict / Missing Rule)
 * để hiển thị chi tiết bên dưới lá số Tử Vi theo yêu cầu của người dùng.
 */

export interface UnverifiedStarInfo {
  id: string;
  name: string;
  category: 'conflict' | 'candidate_spec' | 'candidate_iztro' | 'annual_candidate' | 'brightness_unverified';
  categoryLabel: string;
  reason: string;
  details: string;
  sourceNote: string;
}

export const UNVERIFIED_STARS_LIST: UnverifiedStarInfo[] = [
  // {
  //   id: 'hoa-linh',
  //   name: 'Hỏa Tinh & Linh Tinh',
  //   category: 'conflict',
  //   categoryLabel: 'Mâu thuẫn trường phái',
  //   reason: 'Tranh chấp chiều khởi và cách an thuận nghịch giữa các phái',
  //   details: 'Có phái phân biệt khởi theo năm Dương/Âm, Nam/Nữ; có phái khởi cố định theo giờ. Hiện engine áp dụng công thức ứng viên v1.3 (khởi theo nhóm chi năm + giờ sinh) nhưng chưa chốt khớp 100% với các fixture tuvidauso.ai.studio.',
  //   sourceNote: 'Đặc tả v1.3 / Tham chiếu tuvidauso.ai.studio',
  // },
  // {
  //   id: 'thien-y',
  //   name: 'Thiên Y',
  //   category: 'conflict',
  //   categoryLabel: 'Mâu thuẫn vị trí',
  //   reason: 'Trường phái tranh chấp đồng cung Thiên Diêu hay an riêng',
  //   details: 'Trong một số phái, Thiên Y đồng cung với Thiên Diêu (Sửu + tháng sinh - 1). Một số tài liệu khác an theo chi khác. Cần thêm fixture ảnh đối chiếu để chuẩn hóa vị trí.',
  //   sourceNote: 'Đặc tả v1.3',
  // },
  // {
  //   id: 'thien-khoi-viet',
  //   name: 'Thiên Khôi & Thiên Việt (Can Canh, Kỷ, Quý)',
  //   category: 'conflict',
  //   categoryLabel: 'Lệch quan sát thực tế',
  //   reason: 'Bảng lý thuyết khác biệt với một số ảnh mẫu tuvidauso.ai.studio',
  //   details: 'Khôi/Việt khớp ảnh tuvidauso.ai.studio ở Can Giáp, Ất, Bính, Tân. Nhưng với Can Canh (ảnh TV-001/007 thấy Ngọ–Dần thay vì Sửu–Mùi), Kỷ (ảnh TV-003 thấy Tý–Thân), Quý (ảnh TV-002 thấy Mão–Tỵ). Hiện engine đang gắn cờ CONFLICT cho 3 Can này.',
  //   sourceNote: 'Fixture tuvidauso.ai.studio TV-001, TV-002, TV-003, TV-007',
  // },
  {
    id: 'vong-bac-si',
    name: 'Vòng Bác Sĩ (12 sao)',
    category: 'candidate_spec',
    categoryLabel: 'Công thức ứng viên',
    reason: 'Bác Sĩ, Lực Sĩ, Thanh Long, Tiểu Hao, Tướng Quân, Tấu Thư, Phi Liêm, Hỷ Thần, Bệnh Phù, Đại Hao, Phục Binh, Quan Phủ',
    details: 'Khởi từ vị trí Lộc Tồn, an thuận với Dương Nam / Âm Nữ, nghịch với Âm Nam / Dương Nữ. Logic vị trí vẫn là công thức ứng viên; ngũ hành đã chuẩn hóa Lực Sĩ thuộc Thủy và Quan Phủ thuộc Hỏa. Chưa được đối chiếu tự động trên bộ 48 fixture đầy đủ tên phụ tinh.',
    sourceNote: 'Đặc tả thuật toán v1.3',
  },
  {
    id: 'vong-trang-sinh',
    name: 'Vòng Tràng Sinh (12 giai đoạn)',
    category: 'candidate_spec',
    categoryLabel: 'Công thức ứng viên',
    reason: 'Tràng Sinh, Mộc Dục, Quan Đới, Lâm Quan, Đế Vượng, Suy, Bệnh, Tử, Mộ, Tuyệt, Thai, Dưỡng',
    details: 'Khởi cung theo Cục: Thủy Nhị Cục (Thân), Mộc Tam Cục (Hợi), Kim Tứ Cục (Tỵ), Thổ Ngũ Cục (Thân - đã chốt theo D15), Hỏa Lục Cục (Dần). Vận hành thuận nghịch theo Dương Nam Âm Nữ. Cần tiếp tục đối chiếu thêm các trường hợp đặc biệt.',
    sourceNote: 'Đặc tả thuật toán v1.3 / Quyết định D15',
  },
  {
    id: 'phu-tinh-ngay-thang',
    name: 'Phụ tinh an theo ngày & tháng sinh',
    category: 'candidate_iztro',
    categoryLabel: 'Tham khảo Iztro / Ứng viên',
    reason: 'Tam Thai, Bát Tọa, Ân Quang, Thiên Quý, Thiên Vu, Âm Sát, Thiên Nguyệt',
    details: 'Các sao phụ này phụ thuộc vị trí Tả Phù/Hữu Bật và Văn Xương/Văn Khúc hoặc tháng sinh. Vị trí hiện tại được mượn từ thư viện Iztro và đặc tả v1.3, chưa hoàn tất trích xuất expected đầy đủ từ ảnh tuvidauso.ai.studio.',
    sourceNote: 'Tham chiếu Iztro & Đặc tả v1.3',
  },
  // {
  //   id: 'tu-hoa-ban-menh',
  //   name: 'Tứ Hóa Bản Mệnh (Khoa, Quyền, Lộc, Kỵ)',
  //   category: 'candidate_spec',
  //   categoryLabel: 'Công thức ứng viên',
  //   reason: 'Tứ Hóa an theo Can năm sinh',
  //   details: 'Đã triển khai bảng 10 Can truyền thống (Giáp Liêm-Phá-Vũ-Dương, Ất Cơ-Lương-Vi-Âm...). Cần kiểm tra đủ 10 Can trên fixture tuvidauso.ai.studio thực tế trước khi nâng trạng thái thành VERIFIED.',
  //   sourceNote: 'Bảng Tứ Hóa v1.3',
  // },
  {
    id: 'sao-luu-nien',
    name: 'Lớp Sao Lưu Niên (v0.2.4)',
    category: 'annual_candidate',
    categoryLabel: 'Ứng viên sao lưu',
    reason: 'Lưu Thiên Không, Lưu Tuần, Lưu Triệt, Lưu Xương, Lưu Khúc, Lưu Văn Tinh, Lưu Khôi/Việt, Lưu Tứ Hóa',
    details: 'Đã tích hợp Lưu Thiên Khôi theo Can năm xem, cùng các quy tắc: Lưu Thiên Không tiến 1 từ Lưu Thái Tuế; Lưu Tuần Không theo Giáp tuần; Lưu Triệt Không theo Can năm xem; Lưu Xương/Khúc theo Trung Châu phái; Lưu Niên Văn Tinh cố định theo Can năm sinh; Lưu Tứ Hóa bám sao gốc. Sao lưu vẫn cần fixture đa năm (2025/2026/2027) để nghiệm thu độc lập với tuvidauso.ai.studio.',
    sourceNote: 'Tài liệu SAO_LUU_NIEN_v0_2_4.md',
  },
  {
    id: 'do-sang-sao',
    name: 'Độ sáng sao (Miếu, Vượng, Đắc, Bình, Hãm)',
    category: 'brightness_unverified',
    categoryLabel: 'Chưa kiểm chứng nguồn',
    reason: 'Tạm hiển thị dấu "?" cạnh tên sao',
    details: 'Theo nguyên tắc sản phẩm không suy đoán và không bịa đặt dữ liệu phong thủy, khi chưa có bảng Miếu/Vượng/Đắc/Bình/Hãm có nguồn trích dẫn đối chiếu rõ ràng với tuvidauso.ai.studio, hệ thống đánh dấu "?" để người dùng nắm rõ.',
    sourceNote: 'Yêu cầu Release Gate / star-metadata.ts',
  },
];
