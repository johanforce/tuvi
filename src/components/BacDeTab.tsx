import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronDown, Dice5, LoaderCircle, Sparkles } from 'lucide-react';
import bacDeJson from '../51_que_bac_de.json?raw';

interface VerseSection {
  han: string;
  am: string;
  dich: string;
  ban: string;
}

interface BacDeCard {
  id: number;
  rating: string;
  title: string;
  tich: string;
  thi: { han: string; am: string; dich: string };
  sections: Record<string, VerseSection>;
}

const CARDS = JSON.parse(bacDeJson) as BacDeCard[];
const SECTION_LABELS: Record<string, string> = {
  gia_dao: 'Gia đạo',
  tuoi_mang: 'Tuổi mạng',
  buon_ban: 'Buôn bán',
  muu_vong: 'Mưu vọng',
  luc_suc: 'Lục súc',
  nguoi_di: 'Người đi',
  hon_nhan: 'Hôn nhân',
  kien_tung: 'Kiện tụng',
  that_vat: 'Thất vật',
  doan_benh: 'Đoán bệnh',
};

interface BacDeTabProps {
  number: number;
  showResult: boolean;
  onNumberChange: (number: number) => void;
  onRead: (number: number) => void;
  onCast: (number: number) => void;
}

export const BacDeTab: React.FC<BacDeTabProps> = ({ number, showResult, onNumberChange, onRead, onCast }) => {
  const [draftNumber, setDraftNumber] = useState(String(number));
  const selectedNumber = Number(draftNumber);
  const card = useMemo(() => CARDS.find(item => item.id === number), [number]);
  const [aiText, setAiText] = useState('');
  const [aiError, setAiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDraftNumber(String(number));
    setAiText('');
    setAiError('');
  }, [number]);

  const read = () => {
    if (Number.isInteger(selectedNumber) && selectedNumber >= 1 && selectedNumber <= 51) onRead(selectedNumber);
  };
  const cast = () => {
    const drawable = CARDS.filter(item => item.id >= 1 && item.id <= 50);
    if (!drawable.length) return;
    onCast(drawable[Math.floor(Math.random() * drawable.length)]!.id);
  };

  const requestAiReading = async () => {
    if (!card) return;
    setLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/bac-de/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: card.id }),
      });
      const result = await response.json() as { text?: string; error?: string };
      if (!response.ok) throw new Error(result.error || 'Không thể tạo luận giải.');
      setAiText((result.text ?? '').trim());
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <section className="paper-card-double p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-950 to-oriental-gold text-white shadow-md">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Tra cứu • Chiêm nghiệm</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-oriental-crimson">Quẻ Bắc Đế đền Hệ</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">Tra nội dung theo số thẻ hoặc gieo ngẫu nhiên một quẻ để xem bài thơ, tích truyện và lời bàn theo từng phương diện.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-900/15 bg-white/70 p-4 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="bac-de-number" className="field-label">Số quẻ (1–51)</label>
          <input
            id="bac-de-number"
            type="number"
            min={1}
            max={51}
            value={draftNumber}
            disabled={loading}
            onChange={event => {
              const value = event.target.value;
              setDraftNumber(value);
              const nextNumber = Number(value);
              if (Number.isInteger(nextNumber) && nextNumber >= 1 && nextNumber <= 51) onNumberChange(nextNumber);
            }}
            onKeyDown={event => { if (event.key === 'Enter') read(); }}
            className="field no-icon"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={read} disabled={loading} className="btn btn-primary disabled:cursor-wait"><BookOpen className="h-4 w-4" />Đọc quẻ</button>
          <button type="button" onClick={cast} disabled={loading} className="btn btn-outline disabled:cursor-wait"><Dice5 className="h-4 w-4" />Gieo quẻ</button>
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-stone-500">Gieo quẻ trong ứng dụng chọn ngẫu nhiên trong các thẻ 1–50 có dữ liệu. File hiện chưa có nội dung quẻ số 3; quẻ 51 “Toàn phước” có thể tra cứu nhưng không được đưa vào lượt gieo theo mô tả trong bài viết. Đây là cách tra cứu tham khảo, không thay cho nghi thức xin thẻ tại đền.</p>
    </section>

    {showResult && !card && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      File hiện chưa có nội dung cho quẻ số {number}. Hãy chọn quẻ khác hoặc bổ sung nội dung cho số này.
    </div>}

    {showResult && card && <article className="paper-card-double space-y-6 p-5 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-900/15 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">Linh từ đệ {card.id} thiêm</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-oriental-crimson">{card.title}</h2>
        </div>
        <span className="rounded-full border border-amber-400/70 bg-amber-100 px-3 py-1 text-sm font-bold text-amber-950">{card.rating}</span>
      </header>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="paper-inset space-y-3 p-4">
          <h3 className="font-serif text-lg font-bold text-oriental-crimson">Bài thơ tổng đề</h3>
          <div><h4 className="text-sm font-semibold text-stone-700">Hán tự</h4><p className="font-hanzi whitespace-pre-line text-lg leading-8" lang="zh">{card.thi.han}</p></div>
          <div><h4 className="text-sm font-semibold text-stone-700">Âm</h4><p className="whitespace-pre-line text-sm leading-6">{card.thi.am}</p></div>
          <div><h4 className="text-sm font-semibold text-stone-700">Dịch nghĩa</h4><p className="whitespace-pre-line text-sm leading-6">{card.thi.dich}</p></div>
        </section>
        <section className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-oriental-crimson">Tích quẻ</h3>
          <p className="whitespace-pre-line text-sm leading-7 text-stone-700">{card.tich || 'Chưa có phần tích quẻ trong dữ liệu.'}</p>
        </section>
      </div>

      <section className="space-y-3">
        <div>
          <h3 className="font-serif text-xl font-bold text-oriental-crimson">Luận theo phương diện</h3>
          <p className="mt-1 text-xs text-stone-500">Chọn từng mục để mở phần Hán tự, âm, dịch nghĩa và lời bàn.</p>
        </div>
        <div className="space-y-2">
          {Object.entries(card.sections).map(([key, section]) => {
            const label = SECTION_LABELS[key] ?? key;
            if (!section || !(section.han || section.am || section.dich || section.ban)) return null;
            const preview = section.ban.replace(/\s+/g, ' ').trim();
            return <details key={key} className="group overflow-hidden rounded-xl border border-amber-900/15 bg-white/65 transition-colors open:bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 marker:hidden hover:bg-amber-50/70 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0"><span className="block font-serif font-bold text-oriental-crimson">{label}</span>{preview && <span className="mt-0.5 block truncate text-xs font-normal text-stone-500">{preview}</span>}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-amber-800 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="space-y-3 border-t border-amber-900/10 bg-[#fffdfa] px-4 py-4">
                {section.han && <div><h4 className="text-xs font-semibold text-stone-500">Hán tự</h4><p className="font-hanzi whitespace-pre-line text-sm leading-6" lang="zh">{section.han}</p></div>}
                {section.am && <div><h4 className="text-xs font-semibold text-stone-500">Âm</h4><p className="whitespace-pre-line text-sm leading-6">{section.am}</p></div>}
                {section.dich && <div><h4 className="text-xs font-semibold text-stone-500">Dịch nghĩa</h4><p className="whitespace-pre-line text-sm leading-6">{section.dich}</p></div>}
                {section.ban && <div className="rounded-lg bg-white/70 p-3"><h4 className="text-xs font-semibold uppercase tracking-wide text-amber-900">Lời bàn trong bản dịch</h4><p className="mt-1 whitespace-pre-line text-sm leading-6 text-stone-700">{section.ban}</p></div>}
              </div>
            </details>;
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-red-900/15 bg-red-50/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-oriental-crimson"><Sparkles className="h-5 w-5" />AI luận giải</h3>
            <p className="mt-1 text-xs leading-5 text-stone-600">AI diễn giải nội dung quẻ để tham khảo; không xem lời quẻ là lời tiên đoán chắc chắn.</p>
          </div>
          <button type="button" onClick={() => void requestAiReading()} disabled={loading} className="btn btn-primary disabled:cursor-wait">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Đang luận giải…' : aiText ? 'Luận giải lại bằng AI' : 'AI luận giải'}
          </button>
        </div>
        {aiError && <p role="alert" className="mt-3 rounded-lg border border-red-300 bg-white p-3 text-sm text-red-800">{aiError}</p>}
        {aiText && <div className="mt-4 whitespace-pre-wrap rounded-xl bg-white/80 p-4 text-sm leading-7 text-stone-800">{aiText}</div>}
      </section>
    </article>}

    <section className="paper-card space-y-5 p-5 sm:p-8">
      <header>
        <h2 className="font-serif text-2xl font-bold text-oriental-crimson">Quẻ thẻ đền Hệ xã Thụy Ninh, Thái Thụy</h2>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500">
          <time dateTime="2018-01-17">17/01/2018</time>
          <a className="underline decoration-amber-700 underline-offset-2" href="https://ngocsac.wordpress.com/author/ngocsac/" target="_blank" rel="noreferrer">ngocsac</a>
          <a className="underline decoration-amber-700 underline-offset-2" href="https://ngocsac.wordpress.com/2018/01/17/que%CC%89-the%CC%89-den-he%CC%A3-xa%CC%83-thu%CC%A3y-ninh-thai-thuy/#respond" target="_blank" rel="noreferrer">Bình luận về bài viết này</a>
          <a className="underline decoration-amber-700 underline-offset-2" href="https://ngocsac.wordpress.com/2018/01/17/que%CC%89-the%CC%89-den-he%CC%A3-xa%CC%83-thu%CC%A3y-ninh-thai-thuy/#comments" target="_blank" rel="noreferrer">Go to comments</a>
        </div>
      </header>

      <div className="space-y-4 text-sm leading-7 text-stone-700">
        <p>Thẻ Đền Hệ đến nay vẫn còn giữ nguyên bản in bằng chữ Hán. Tuy nhiên, có một số người giải thẻ kết hợp thêm xem tướng, xem tay để tán giải không chính xác. Nội dung của những thẻ chữ Hán này vốn dĩ không phải của Việt Nam, mà từ Trung Quốc theo ảnh hưởng của tín ngưỡng Đạo giáo du nhập vào.</p>
        <p>Theo thần tích, đền Hệ thờ hai vị thần là đức Ngô Đồng và Bà Ả là tướng quân thời Hùng Vương. Đến thời nhà Lý, tướng quân Lý Đạo Thành phụng mệnh vua đi đánh quân xâm lược Chiêm Thành có đóng quân tại vùng đất này. Hai vị thần trên đều hiển linh báo mộng cho Lý Đạo Thành sẽ âm phù cho thắng lợi. Sau khi thắng giặc trở về, Lý Đạo Thành đã tâu xin triều đình cho sửa sang lại đền thờ của các vị. Vua Lý chuẩn y và xuống chiếu phong sắc cho các vị làm Phúc thần làng Ninh Cù.</p>
        <p>Cũng theo thần tích, đến thế kỷ 13, khi quân Nguyên xâm lược nước ta, các vua Trần đã sai quan về cầu đảo tại đền, xin các vị thần âm phù cho thắng giặc. Sau khi kháng chiến thắng lợi, các vua Trần đều có sắc truy phong cho các vị thần và đều được liệt vào hạng tối linh Thượng đẳng thần.</p>
        <figure className="overflow-hidden rounded-xl border border-amber-900/10 bg-white">
          <img src="https://ngocsac.wordpress.com/wp-content/uploads/2018/01/image015.jpg?w=595" alt="Một lá thẻ đền Hệ" loading="lazy" className="mx-auto max-h-96 max-w-full object-contain" />
          <figcaption className="p-2 text-center text-xs text-stone-500">Một lá thẻ đền Hệ</figcaption>
        </figure>

        <h3 className="pt-2 font-serif text-lg font-bold text-oriental-crimson">Rút thẻ Đền Hệ</h3>
        <p>Hàng năm vào dịp đầu năm hoặc lễ hội tháng 7, người dân các xã bên cạnh và khách khắp nơi thường đi lễ Đền Hệ và nhân tiện xin một quẻ thẻ để coi xem việc hung cát trong vòng năm đó. Quẻ thẻ đền Hệ được in trên giấy vàng, toàn là chữ Hán nên sau khi xin thẻ xong mọi người phải nhờ thầy dịch hộ. Cảnh các thầy dịch thẻ ngồi la liệt ở nhà khách, mọi người vây xung quanh chờ đợi đến lượt mình không lạ gì. Có năm khách đi lễ đông, rút được thẻ mà không thể đợi tán thẻ đành phải mang thẻ về. Nhiều người nói thẻ đền Hệ linh thiêng, xin là đúng. Nhưng đúng hay không còn phải tìm được thầy nào giải tốt một chút. Năm nào cũng vậy, mấy thầy tuổi đã cao, sức khỏe có yếu, có kinh nghiệm giải thẻ nhiều năm thường được mọi người tìm đến, lâu mấy cũng đợi. Các thầy cũng làm việc hết sức, cơm nước chỉ qua loa, tiếng cũng khàn không nói được.</p>
        <figure className="overflow-hidden rounded-xl border border-amber-900/10 bg-white">
          <img src="https://ngocsac.wordpress.com/wp-content/uploads/2018/01/image016.jpg?w=595" alt="Đền Hệ xã Thụy Ninh" loading="lazy" className="mx-auto max-h-96 max-w-full object-contain" />
          <figcaption className="p-2 text-center text-xs text-stone-500">Đền Hệ xã Thụy Ninh</figcaption>
        </figure>
        <p>Người xưa có câu: “linh tại ngã, bất linh tại ngã”. Nếu tin thì cho là đúng, không tin thì cũng coi đó mà sống cho phải đạo Thánh khuyên. Các thầy giải thẻ, phần lớn đều hiểu biết chữ Hán, dựa trên kinh nghiệm và học hỏi lẫn nhau nên cứ theo Thánh ý trên thẻ mà phán. Có thầy, chỉ nhìn số trên thẻ, rồi tra vào quyển vở đã ghi sẵn nội dung tương ứng bằng tiếng Việt của từng thẻ rồi vừa đọc vừa diễn giải.</p>
        <figure className="overflow-hidden rounded-xl border border-amber-900/10 bg-white">
          <img src="https://ngocsac.wordpress.com/wp-content/uploads/2018/01/image014.jpg?w=328&h=185" alt="Cảnh chờ đợi tán thẻ tại đền Hệ" loading="lazy" className="mx-auto max-h-72 max-w-full object-contain" />
          <figcaption className="p-2 text-center text-xs text-stone-500">Cảnh chờ đợi tán thẻ tại đền Hệ</figcaption>
        </figure>

        <h3 className="pt-2 font-serif text-lg font-bold text-oriental-crimson">Xuất xứ Quẻ thẻ đền Hệ</h3>
        <p>Nói chung đã là rút thẻ thì đó là theo tín ngưỡng của Đạo giáo. Thẻ đền Hệ còn gọi là thẻ Bắc Đế, có tất cả 51 thẻ. Đền Hệ chỉ sử dụng 50/51 thẻ, thẻ 51 là thẻ “toàn phước” không sử dụng. Bắc Đế là vị thần phương Bắc, trong tín ngưỡng Đạo giáo của Trung Quốc.</p>
        <figure className="overflow-hidden rounded-xl border border-amber-900/10 bg-white">
          <img src="https://ngocsac.wordpress.com/wp-content/uploads/2018/01/b27c8f8a042aeb74b23b.jpg?w=339&h=254" alt="Giá để thẻ đền Hệ" loading="lazy" className="mx-auto max-h-72 max-w-full object-contain" />
          <figcaption className="p-2 text-center text-xs text-stone-500">Giá để thẻ đền Hệ</figcaption>
        </figure>
        <p>Theo Wikipedia: “Huyền Vũ (玄武), còn gọi là Chân Võ đại đế, Bắc đế Chân Võ đế quân, Đãng Ma Thiên tôn, Hắc Đế, là một vị thần quan trọng của Đạo giáo, là một trong Tứ tượng của Thiên văn học Trung Quốc, và cũng là một khái niệm rộng trong phong thủy, thuyết âm dương, triết học. Huyền Vũ là linh vật thiêng liêng có tượng là hình con rắn quấn quanh con rùa, có màu đen (huyền, 玄) là màu của hành Thủy ở phương Bắc, do đó tương ứng với mùa đông.”</p>
        <figure className="overflow-hidden rounded-xl border border-amber-900/10 bg-white">
          <img src="https://ngocsac.wordpress.com/wp-content/uploads/2018/01/image017.jpg?w=258&h=292" alt="Tượng Huyền Vũ tại Đài Loan" loading="lazy" className="mx-auto max-h-80 max-w-full object-contain" />
          <figcaption className="p-2 text-center text-xs text-stone-500">Tượng Huyền Vũ tại Đài Loan</figcaption>
        </figure>
        <p>Theo truyền thuyết tại Trung Quốc: “Huyền Vũ vốn là tinh tú trên trời. Giờ ngọ, ngày ba tháng ba hấp thụ tinh khí của Thái Dương, mới đầu thai vào bụng hoàng hậu nước Tịnh Lạc, 14 tháng sau mới giáng sinh. Năm 15 tuổi, Huyền Vũ rời cha mẹ, đến một nơi thâm sơn cùng cốc để tu hành đạo thuật. Hành động đó làm cảm động Ngọc Thanh Thái tổ Tử Hư Nguyên quân, Nguyên quân chỉ dẫn cho chàng vượt biển, cưỡi chim đại bàng vượt 5 vạn dặm tìm đến một ngọn núi tiên cư trú. Thế là Huyền Vũ bay đến ngọn núi Võ Đang ở tỉnh Hồ Bắc, tu luyện 42 năm. Năm 57 tuổi, buổi sớm ngày 9 tháng 9 thì tiên trên trời bay xuống mời Huyền Vũ lên trời làm tiên. Được Ngọc Hoàng đại đế cử chỉ huy thiên binh thiên tướng đi thanh lý cõi âm, trấn áp Lục thiên ma vương thắng lợi. Ngọc hoàng phong cho làm Chân Võ đại đế”.</p>
        <p>Còn ở Việt Nam: “Huyền Vũ còn được gọi là Trấn Vũ (hay Trấn Võ), Huyền Thiên Trấn Vũ, vị thần trấn trị phương Bắc. Thần đã giúp An Dương Vương trừ các loại ma quỷ trong lúc xây thành Cổ Loa (cùng thần Kim Quy). Thần được thờ trong Đền Quán Thánh (Trấn Vũ Quán) – là một trong Thăng Long tứ trấn, Thăng Long tứ quán, được xây dựng dưới thời Lý Thái Tổ (1010-1028)”.</p>
        <p>Toàn bộ nội dung của 51 thẻ Bắc Đế được đăng tải trên một trang web rút thẻ Online của Đài Loan tại địa chỉ: <a className="underline decoration-amber-700 underline-offset-2" href="http://www.golla.tw" target="_blank" rel="noreferrer">http://www.golla.tw</a>. Nội dung bản tiếng Việt cũng được dịch và cung cấp trên trang <a className="underline decoration-amber-700 underline-offset-2" href="http://hocthuatphuongdong.vn" target="_blank" rel="noreferrer">Học Thuật Phương Đông</a>.</p>

        <h3 className="pt-2 font-serif text-lg font-bold text-oriental-crimson">Giải thẻ số 9 đền Hệ</h3>
        <p>Bây giờ theo thông tin có thể tìm thấy trên internet thì xin giải Thẻ số 9 của đền Hệ (như thông tin có thể tìm thấy trên internet):</p>
        <p className="font-semibold">Linh Từ Đệ Cửu Thiêm: Trung Bình chi Kiệu (Thẻ Trung Bình)</p>
        <p><strong>Về tích của thẻ: Tứ Thái Tử chinh phạt Trung Nguyên.</strong> Tứ Thái Tử nước Kim là Ngột Truật đánh vào Trung Nguyên, chiếm thành An Châu, tướng giữ thành là Lục Đăng chết đứng. Ngột Truật vái lạy xong mới chịu ngã. Kính trọng sự anh hùng, Ngột Truật bèn thu nhận con nhỏ của Lục Đăng là Vân Long làm dưỡng tử. Sau tướng nhà Tống là Vương Tá dùng khổ nhục kế, chặt tay trá hàng mà lại được mẹ Lục Vân Long thuyết phục, mới đem song thương quay về Tống. Ông cháu cha con 2 đời làm Thừa Tướng, 4 đời đỗ Trạng Nguyên.</p>
        <figure className="overflow-hidden rounded-xl border border-amber-900/10 bg-white">
          <img src="https://ngocsac.wordpress.com/wp-content/uploads/2018/01/de31ac4827e8c8b691f9.jpg?w=343&h=258" alt="Tán thẻ tại Đền Hệ" loading="lazy" className="mx-auto max-h-80 max-w-full object-contain" />
          <figcaption className="p-2 text-center text-xs text-stone-500">Tán thẻ tại Đền Hệ</figcaption>
        </figure>
        <p>Ở Thẻ đền Hệ không có phần dẫn tích cổ. Chỉ in 4 câu thơ tổng đề sau đó là các phần như Tự thân, Gia trạch, Mưu vọng, Hôn nhân, Lục giáp, Phong thủy, Hành nhân, Thất vật, Tật bệnh, Quan tụng. Cuối thẻ là phần Giải viết: tổng quát lại các việc trên hung cát đại khái ra sao.</p>
        <p>4 câu thơ tổng đề rằng:</p>
        <blockquote className="whitespace-pre-line border-l-4 border-oriental-gold pl-4 italic text-stone-600">“Chu độ trường giang thủy<br />Phong cuồng lãng cánh đào<br />Đại xà xâm hộ dũ<br />Ngũ quỷ nộ trọng thương đao”.</blockquote>
        <p><strong>Dịch nghĩa</strong><br />Thuyền đi trên sông dài,<br />Gió lộng sóng càng cao<br />Rắn bò vào cửa sổ<br />Ma quỷ múa gươm đao</p>
        <p>Thẻ số 9 phần Tự thân có 4 câu thơ:</p>
        <blockquote className="whitespace-pre-line border-l-4 border-oriental-gold pl-4 italic text-stone-600">“Phương lan xuân cảnh chân kham ái<br />Cúc thố thu quang sắc hựu giai<br />Càn khôn các tự duy tiêu tức<br />Bất giả xuân phong suy đệ khai”.</blockquote>
        <p><strong>Dịch nghĩa:</strong><br />“Xuân đến lan thơm đẹp đáng yêu<br />Cúc đón nắng thu sắc mỹ miều<br />Đất trời tự tới đưa tin tức<br />Không có gió xuân vẫn nở đều”</p>
        <p>Mấy câu này, nếu thầy phán thì sẽ phán qua loa thế này: Tuổi tốt, vận mạng thanh cao, như lan cúc tỏa hương, phòng tháng 4, 5, 7 có bệnh nhẹ tranh cãi, sức khỏe tốt.</p>
        <p>Phần Gia trạch (Đất cát, nhà cửa) có 4 câu:</p>
        <blockquote className="whitespace-pre-line border-l-4 border-oriental-gold pl-4 italic text-stone-600">“Chỉ vọng gia hòa vạn sự thành<br />Niên lai sầu muộn vị tằng thân<br />Nhân hà bất bả gia thần kính<br />Môn hộ vô nhân hữu lưỡng thanh”.</blockquote>
        <p><strong>Dịch nghĩa:</strong><br />Mong được thuận hòa mọi việc nên<br />Buồn khổ năm nay chưa được hên<br />Tại nhà thần thánh không thờ cúng<br />Vắng hoang nhà cửa tiếng kêu rền</p>
        <p>Tức là: Muốn được thành việc, nên cúng vái thần và tổ đường ở nhà, phòng mùa hạ có trở ngại.</p>
        <p>Những phần khác cũng tương tự là 4 câu thơ như vậy.</p>
        <p className="border-t border-amber-900/10 pt-4">Tôi hy vọng thẻ đền Hệ cũng như thẻ tại một số đền khác như đền Mẫu (Hưng Yên), đền Cờn (Nghệ An) cũng được dịch ra Quốc ngữ cho mọi người được biết, hạn chế việc lợi dụng tán thẻ tràn lan, không chính xác.</p>
        <p className="text-xs text-stone-500">Nguồn nội dung và hình ảnh: <a className="underline decoration-amber-700 underline-offset-2" href="https://ngocsac.wordpress.com/2018/01/17/que%CC%89-the%CC%89-den-he%CC%A3-xa%CC%83-thu%CC%A3y-ninh-thai-thuy/" target="_blank" rel="noreferrer">bài viết Quẻ thẻ đền Hệ xã Thụy Ninh, Thái Thụy</a>.</p>
      </div>
    </section>
  </div>;
};
