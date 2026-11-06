import { yearCanChi } from '../calendar/can-chi.js';
import { branchName, mod, stemName } from './constants.js';
import type { AnnualPendingStar, StarPlacement } from './types.js';
import { placeThaiTueCircle, placeYearBranchStars, placeYearStemStars } from './stars-secondary.js';

const annual = (star: StarPlacement, id: string, name: string, note?: string, status: StarPlacement['status'] = 'CANDIDATE_SPEC'): StarPlacement => ({
  ...star,
  id,
  name,
  scope: 'annual',
  status,
  ...(note ? { note } : {}),
});

// Các bảng dưới đây được cung cấp riêng cho lớp sao lưu. Chỉ số Can: Giáp=0…Quý=9;
// chỉ số Chi: Tý=0…Hợi=11.
const VAN_TINH_BY_BIRTH_STEM = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3] as const;
const VAN_XUONG_BY_VIEWED_STEM = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3] as const;
const VAN_KHUC_BY_VIEWED_STEM = [9, 8, 6, 5, 6, 5, 3, 2, 0, 11] as const;
const TRIET_KHONG_BY_VIEWED_STEM: ReadonlyArray<readonly [number, number]> = [
  [8, 9], [6, 7], [4, 5], [2, 3], [0, 1],
  [8, 9], [6, 7], [4, 5], [2, 3], [0, 1],
];

/** Trả về hai địa chi Tuần Không từ Giáp tuần chứa năm Can Chi đã cho. */
function getTuanKhongBranches(stem: number, branch: number): { startBranch: number; branches: [number, number] } {
  let cycleIndex = -1;
  for (let i = 0; i < 60; i += 1) {
    if (i % 10 === mod(stem, 10) && i % 12 === mod(branch)) {
      cycleIndex = i;
      break;
    }
  }
  if (cycleIndex < 0) throw new Error(`Can Chi không hợp lệ: ${stemName(stem)} ${branchName(branch)}`);
  const xunStartIndex = Math.floor(cycleIndex / 10) * 10;
  const startBranch = mod(xunStartIndex);
  return {
    startBranch,
    branches: [mod(startBranch + 10), mod(startBranch + 11)],
  };
}

/**
 * Sao lưu niên. Các bảng/công thức trong module này là quy tắc do người dùng cung cấp
 * hoặc công thức ứng viên đã ghi chú; chưa đồng nghĩa đã được đối chiếu với tuvidauso.ai.studio.
 * `birthYearStem` là Can năm sinh âm lịch, cần cho Lưu Niên Văn Tinh (sao cố định).
 */
export function placeAnnualStars(viewedYear: number, birthYearStem: number): {
  yearCanChi: ReturnType<typeof yearCanChi>;
  stars: StarPlacement[];
  pending: AnnualPendingStar[];
} {
  const cc = yearCanChi(viewedYear);
  const birthStem = mod(birthYearStem, 10);
  const stemStars = placeYearStemStars(cc.stem);
  const branchStars = placeYearBranchStars(cc.branch, 0, 0);
  const thaiTueCircle = placeThaiTueCircle(cc.branch);

  const byId = (items: StarPlacement[], id: string) => {
    const found = items.find(s => s.id === id);
    if (!found) throw new Error(`Không tìm thấy sao nền: ${id}`);
    return found;
  };
  const locTon = byId(stemStars, 'loc-ton');
  const thienMa = byId(branchStars, 'thien-ma');
  const daoHoa = byId(branchStars, 'dao-hoa');
  const hongLoan = byId(branchStars, 'hong-loan');
  const thienHy = byId(branchStars, 'thien-hy');
  const thienKhoc = byId(branchStars, 'thien-khoc');
  const thienHu = byId(branchStars, 'thien-hu');
  const thienDuc = byId(branchStars, 'thien-duc');
  const nguyetDuc = byId(branchStars, 'nguyet-duc');
  const kiepSat = byId(branchStars, 'kiep-sat');
  const thienTru = byId(stemStars, 'thien-tru');
  const thienKhoi = byId(stemStars, 'thien-khoi');
  const thienViet = byId(stemStars, 'thien-viet');

  const thaiTue = annual(byId(thaiTueCircle, 'thai-tue-0'), 'luu-thai-tue', 'Lưu Thái Tuế', 'Đóng tại cung có địa chi trùng với chi năm xem.');
  const tangMon = annual(byId(thaiTueCircle, 'thai-tue-2'), 'luu-tang-mon', 'Lưu Tang Môn');
  const bachHo = annual(byId(thaiTueCircle, 'thai-tue-8'), 'luu-bach-ho', 'Lưu Bạch Hổ');
  const thienKhong = annual(
    byId(thaiTueCircle, 'thai-tue-1'),
    'luu-thien-khong',
    'Lưu Thiên Không',
    'Theo quy tắc được cung cấp: từ cung Thái Tuế năm xem tiến thuận 1 cung, đồng cung Thiếu Dương. Tên gọi có khác biệt giữa các trường phái.',
  );

  const tuan = getTuanKhongBranches(cc.stem, cc.branch);
  const trietPair = TRIET_KHONG_BY_VIEWED_STEM[cc.stem]!;
  // Lưu Văn Tinh theo Can năm sinh; đặt sớm để không bị cắt khỏi cung khi
  // ô lá số có nhiều sao phụ tinh.
  const vanTinh = annual(
    { ...thaiTue, branch: VAN_TINH_BY_BIRTH_STEM[birthStem]! },
    'luu-van-tinh',
    'Lưu Văn Tinh',
    `Lưu Niên Văn Tinh: an theo Can năm sinh (${stemName(birthStem)}), cố định trên lá số gốc; không đổi theo năm xem.`,
  );
  const stars: StarPlacement[] = [
    vanTinh,
    thaiTue,
    thienKhong,
    annual({ ...locTon, branch: locTon.branch + 1 }, 'luu-kinh-duong', 'Lưu Kình Dương', 'Ứng viên: một cung trước Lưu Lộc Tồn.'),
    annual({ ...locTon, branch: locTon.branch - 1 }, 'luu-da-la', 'Lưu Đà La', 'Ứng viên: một cung sau Lưu Lộc Tồn.'),
    annual(thienKhoc, 'luu-thien-khoc', 'Lưu Thiên Khốc'),
    annual(thienHu, 'luu-thien-hu', 'Lưu Thiên Hư'),
    bachHo,
    tangMon,
    annual(thienMa, 'luu-thien-ma', 'Lưu Thiên Mã'),
    annual(locTon, 'luu-loc-ton', 'Lưu Lộc Tồn'),
    annual(daoHoa, 'luu-dao-hoa', 'Lưu Đào Hoa'),
    annual(hongLoan, 'luu-hong-loan', 'Lưu Hồng Loan'),
    annual(thienHy, 'luu-thien-hy', 'Lưu Thiên Hỷ'),
    annual(thienTru, 'luu-thien-tru', 'Lưu Thiên Trù', 'Giả thuyết: áp lại bảng Thiên Trù theo Can năm xem; cần fixture để xác minh scope lưu niên.'),
    // Các sao bổ sung quan sát trên ảnh tuvidauso.ai.studio: công thức mượn từ vòng/sao gốc tương ứng.
    annual(byId(thaiTueCircle, 'thai-tue-7'), 'luu-long-duc', 'Lưu Long Đức', 'Giả thuyết: vị trí trong vòng Thái Tuế theo chi năm xem.'),
    annual(byId(thaiTueCircle, 'thai-tue-9'), 'luu-phuc-duc', 'Lưu Phúc Đức', 'Giả thuyết: vị trí trong vòng Thái Tuế theo chi năm xem.'),
    annual(thienDuc, 'luu-thien-duc', 'Lưu Thiên Đức'),
    annual(nguyetDuc, 'luu-nguyet-duc', 'Lưu Nguyệt Đức'),
    annual(thienViet, 'luu-thien-viet', 'Lưu Thiên Việt', thienViet.note ?? 'Ứng viên: dùng bảng Thiên Việt theo Can năm xem; bảng gốc còn điểm mâu thuẫn.', thienViet.status === 'CONFLICT' ? 'CONFLICT' : 'CANDIDATE_SPEC'),
    annual(thienKhoi, 'luu-thien-khoi', 'Lưu Thiên Khôi', thienKhoi.note ?? 'An theo Can năm xem; vị trí lấy từ bảng Thiên Khôi.', thienKhoi.status === 'CONFLICT' ? 'CONFLICT' : 'CANDIDATE_SPEC'),
    annual(kiepSat, 'luu-kiep-sat', 'Lưu Kiếp Sát'),

    // Lưu Tuần Không: hai Chi bị khuyết trong Giáp tuần chứa năm xem.
    ...tuan.branches.map((branch, index) => annual(
      { ...thaiTue, branch },
      `luu-tuan-khong-${index + 1}`,
      'Lưu Tuần Không',
      `Theo Giáp ${branchName(tuan.startBranch)} tuần của năm xem (${cc.label}); hai Chi Tuần Không là ${branchName(tuan.branches[0])} và ${branchName(tuan.branches[1])}.`,
    )),
    // Lưu Triệt Không: cặp Chi theo Can năm xem.
    ...trietPair.map((branch, index) => annual(
      { ...thaiTue, branch },
      `luu-triet-khong-${index + 1}`,
      'Lưu Triệt Không',
      `Theo Can ${cc.stemName} của năm xem; cặp Triệt Không là ${branchName(trietPair[0])} và ${branchName(trietPair[1])}.`,
    )),
    // Trung Châu phái: Lưu Xương thuận theo Can năm xem.
    annual(
      { ...thaiTue, branch: VAN_XUONG_BY_VIEWED_STEM[cc.stem]! },
      'luu-van-xuong',
      'Lưu Văn Xương',
      `Trung Châu phái: Lưu Xương khởi Tỵ, Giáp Ất thuận hành; an theo Can ${cc.stemName} năm xem.`,
    ),
    // Trung Châu phái: Lưu Khúc theo bảng nghịch hành được cung cấp.
    annual(
      { ...thaiTue, branch: VAN_KHUC_BY_VIEWED_STEM[cc.stem]! },
      'luu-van-khuc',
      'Lưu Văn Khúc',
      `Trung Châu phái: Lưu Khúc khởi Dậu, Giáp Ất nghịch hành; an theo Can ${cc.stemName} năm xem.`,
    ),
  ];

  const pending: AnnualPendingStar[] = [];

  // Bảo đảm mọi vị trí luôn nằm trong 12 địa chi.
  for (const star of stars) star.branch = mod(star.branch);
  return { yearCanChi: cc, stars, pending };
}
