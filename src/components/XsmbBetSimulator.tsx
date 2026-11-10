import React, { useMemo, useState } from 'react';
import { Dices, Play, RotateCcw, Timer } from 'lucide-react';
import { simulateXsmbSession, type XsmbSession } from '../utils/xsmbSimulator.js';

type BetKind = 'de' | 'loto' | 'de3' | 'loto3';
type Bet = { id: string; kind: BetKind; number: string; amount: number };

const LOTO_POINT_COST = 23000;
const DEFAULT_MAX_DRAWS = 1000;

const money = (value: number) => Math.round(value).toLocaleString('vi-VN') + ' ₫';
const kindLabel: Record<BetKind, string> = {
  de: 'Đề thường',
  loto: 'Lô thường',
  de3: 'Đề 3 càng',
  loto3: 'Lô 3 càng',
};

function parseBets(raw: string, kind: BetKind): { bets: Bet[]; invalid: string[] } {
  const digits = kind.endsWith('3') ? 3 : 2;
  const isLoto = kind === 'loto' || kind === 'loto3';
  const tokens = raw.split(/[\n,;]+/).map(value => value.trim()).filter(Boolean);
  const bets: Bet[] = [];
  const invalid: string[] = [];
  tokens.forEach((token, index) => {
    const match = token.match(new RegExp('^(\\d{' + digits + '})\\s*-\\s*(\\d+(?:\\.\\d+)?)$'));
    if (!match || Number(match[2]) <= 0 || (!isLoto && !Number.isSafeInteger(Number(match[2])))) {
      invalid.push(token);
      return;
    }
    bets.push({ id: kind + '-' + index + '-' + match[1], kind, number: match[1], amount: Number(match[2]) });
  });
  return { bets, invalid };
}

function isHit(session: XsmbSession, bet: Bet): boolean {
  if (bet.kind === 'de') return session.specialThreeDigit.slice(-2) === bet.number;
  if (bet.kind === 'de3') return session.specialThreeDigit === bet.number;
  if (bet.kind === 'loto') return session.results.some(result => result.value.slice(-2) === bet.number);
  return session.lotoThreeDigits.includes(bet.number);
}

function countHits(session: XsmbSession, bet: Bet): number {
  if (bet.kind === 'de' || bet.kind === 'de3') return isHit(session, bet) ? 1 : 0;
  return bet.kind === 'loto'
    ? session.results.filter(result => result.value.slice(-2) === bet.number).length
    : session.lotoThreeDigits.filter(value => value === bet.number).length;
}

function hitReturn(bet: Bet, hits: number, rates: { de: number; loto: number; de3: number; loto3: number }): number {
  if (bet.kind === 'de') return hits * bet.amount * rates.de;
  if (bet.kind === 'de3') return hits * bet.amount * rates.de3;
  if (bet.kind === 'loto') return hits * bet.amount * rates.loto;
  return hits * bet.amount * rates.loto3;
}

function stakeCost(bet: Bet): number {
  return bet.kind === 'loto' || bet.kind === 'loto3' ? bet.amount * LOTO_POINT_COST : bet.amount;
}

export const XsmbBetSimulator: React.FC = () => {
  const [deInput, setDeInput] = useState('23-10000');
  const [lotoInput, setLotoInput] = useState('23-2, 45-3, 08-1');
  const [de3Input, setDe3Input] = useState('123-10000');
  const [loto3Input, setLoto3Input] = useState('123-1');
  const [deOdds, setDeOdds] = useState('70');
  const [lotoPayout, setLotoPayout] = useState('80000');
  const [de3Odds, setDe3Odds] = useState('400');
  const [loto3Payout, setLoto3Payout] = useState('600000');
  const [maxDraws, setMaxDraws] = useState(String(DEFAULT_MAX_DRAWS));
  const [session, setSession] = useState<XsmbSession | null>(null);
  const [tracking, setTracking] = useState<Array<{ bet: Bet; rounds: number | null; hitDate: string | null }>>([]);
  const [trackingCount, setTrackingCount] = useState(0);
  const [trackingComplete, setTrackingComplete] = useState(false);

  const parsed = useMemo(() => {
    const groups = [
      parseBets(deInput, 'de'),
      parseBets(lotoInput, 'loto'),
      parseBets(de3Input, 'de3'),
      parseBets(loto3Input, 'loto3'),
    ];
    return { bets: groups.flatMap(group => group.bets), invalid: groups.flatMap(group => group.invalid) };
  }, [deInput, lotoInput, de3Input, loto3Input]);

  const rates = {
    de: Math.max(0, Number(deOdds) || 0),
    loto: Math.max(0, Number(lotoPayout) || 0),
    de3: Math.max(0, Number(de3Odds) || 0),
    loto3: Math.max(0, Number(loto3Payout) || 0),
  };
  const totalStake = parsed.bets.reduce((sum, bet) => sum + stakeCost(bet), 0);
  const validSettings = Object.values(rates).every(value => Number.isFinite(value) && value >= 0)
    && Number.isInteger(Number(maxDraws)) && Number(maxDraws) >= 1 && Number(maxDraws) <= 10000;

  const runOneDraw = () => {
    setSession(simulateXsmbSession());
    setTracking([]);
    setTrackingCount(0);
    setTrackingComplete(false);
  };

  const runUntilHits = () => {
    if (!parsed.bets.length || !validSettings) return;
    const pending = new Map(parsed.bets.map(bet => [bet.id, { bet, rounds: null as number | null, hitDate: null as string | null }]));
    const firstHits = new Map<string, { bet: Bet; rounds: number; hitDate: string }>();
    const now = new Date();
    let rounds = 0;
    while (pending.size && rounds < Number(maxDraws)) {
      rounds += 1;
      const drawDate = new Date(now.getTime() + (rounds - 1) * 86400000);
      const draw = simulateXsmbSession(Math.random, drawDate);
      for (const [id, item] of pending) {
        if (isHit(draw, item.bet)) {
          item.rounds = rounds;
          item.hitDate = drawDate.toLocaleDateString('vi-VN');
          firstHits.set(id, { bet: item.bet, rounds, hitDate: item.hitDate });
          pending.delete(id);
        }
      }
    }
    const completed = parsed.bets.map(bet => {
      const hit = pending.get(bet.id);
      if (hit) return { bet, rounds: null, hitDate: null };
      const found = firstHits.get(bet.id);
      return found ? { bet, rounds: found.rounds, hitDate: found.hitDate } : { bet, rounds: null, hitDate: null };
    });
    setTracking(completed);
    setTrackingCount(rounds);
    setTrackingComplete(pending.size === 0);
  };

  const roundSummary = session ? parsed.bets.map(bet => ({ bet, hits: countHits(session, bet) })) : [];
  const totalReturn = roundSummary.reduce((sum, row) => sum + hitReturn(row.bet, row.hits, rates), 0);
  const hitTotal = roundSummary.reduce((sum, row) => sum + row.hits, 0);
  const grouped = (['de', 'loto', 'de3', 'loto3'] as BetKind[]).map(kind => ({
    kind,
    rows: roundSummary.filter(row => row.bet.kind === kind),
    stake: parsed.bets.filter(bet => bet.kind === kind).reduce((sum, bet) => sum + stakeCost(bet), 0),
    returned: roundSummary.filter(row => row.bet.kind === kind).reduce((sum, row) => sum + hitReturn(row.bet, row.hits, rates), 0),
  }));

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-red-950">Giả lập ghi cược & quay XSMB</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">Nhập từng lựa chọn theo dạng số-tiền cược (đề) hoặc số-điểm (lô). Mỗi lần quay tạo một phiên miền Bắc ngẫu nhiên gồm 27 kết quả. Không kết nối giao dịch hay đặt cược thật.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900"><Dices className="h-4 w-4" />Mô phỏng ngẫu nhiên</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block"><span className="text-sm font-semibold text-red-950">Đề thường · số-tiền cược</span><textarea value={deInput} onChange={event => setDeInput(event.target.value)} rows={2} placeholder="23-10000, 45-20000" className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-red-800" /><span className="mt-1 block text-xs text-stone-500">Ví dụ: 23-10000, 45-20000 (đơn vị VNĐ).</span></label>
          <label className="block"><span className="text-sm font-semibold text-red-950">Lô thường · số-điểm</span><textarea value={lotoInput} onChange={event => setLotoInput(event.target.value)} rows={2} placeholder="23-2, 45-3, 08-1" className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-red-800" /><span className="mt-1 block text-xs text-stone-500">Ví dụ: 23-2, 45-3. Mỗi điểm = 23.000đ.</span></label>
          <label className="block"><span className="text-sm font-semibold text-red-950">Đề 3 càng · số-tiền cược</span><textarea value={de3Input} onChange={event => setDe3Input(event.target.value)} rows={2} placeholder="123-10000, 456-5000" className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-red-800" /><span className="mt-1 block text-xs text-stone-500">Ví dụ: 123-10000 (VNĐ).</span></label>
          <label className="block"><span className="text-sm font-semibold text-red-950">Lô 3 càng · số-điểm</span><textarea value={loto3Input} onChange={event => setLoto3Input(event.target.value)} rows={2} placeholder="123-1, 456-2" className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-red-800" /><span className="mt-1 block text-xs text-stone-500">Ví dụ: 123-1. Mỗi điểm = 23.000đ.</span></label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block"><span className="text-xs font-semibold text-stone-600">Đề thường · 1 ăn</span><input type="number" min="0" value={deOdds} onChange={event => setDeOdds(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></label>
          <label className="block"><span className="text-xs font-semibold text-stone-600">Lô thường · tiền nhận / điểm trúng</span><input type="number" min="0" value={lotoPayout} onChange={event => setLotoPayout(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></label>
          <label className="block"><span className="text-xs font-semibold text-stone-600">Đề 3 càng · 1 ăn</span><input type="number" min="0" value={de3Odds} onChange={event => setDe3Odds(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></label>
          <label className="block"><span className="text-xs font-semibold text-stone-600">Lô 3 càng · tiền nhận / điểm trúng</span><input type="number" min="0" value={loto3Payout} onChange={event => setLoto3Payout(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></label>
        </div>
        <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-600">Mặc định minh họa: đề thường 1 ăn 70; lô thường 80.000đ/điểm trúng; đề 3 càng 1 ăn 400; lô 3 càng 600.000đ/điểm trúng. Các mức trả thưởng có thể chỉnh để mô phỏng, không phải cam kết hay bảng giá chính thức.</div>
        <div className="mt-3 max-w-xs"><label className="block"><span className="text-xs font-semibold text-stone-600">Giới hạn số kỳ khi theo dõi đến lúc trúng (1–10.000)</span><input type="number" min="1" max="10000" step="1" value={maxDraws} onChange={event => setMaxDraws(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></label></div>

        {parsed.invalid.length > 0 && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">Không nhận dạng được: {parsed.invalid.join(', ')}. Kiểm tra đúng định dạng số-tiền hoặc số-điểm.</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-red-50 p-3"><p className="text-xs text-stone-500">Tổng tiền cược 4 hạng mục</p><p className="mt-1 text-xl font-bold text-red-950">{money(totalStake)}</p></div>
          <div className="rounded-xl bg-amber-50 p-3"><p className="text-xs text-stone-500">Số lựa chọn hợp lệ</p><p className="mt-1 text-xl font-bold text-red-950">{parsed.bets.length}</p></div>
          <div className="rounded-xl bg-stone-50 p-3"><p className="text-xs text-stone-500">Quy đổi lô</p><p className="mt-1 text-xl font-bold text-red-950">23.000đ / điểm</p></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={!parsed.bets.length || !validSettings || parsed.invalid.length > 0} onClick={runOneDraw} className="inline-flex items-center gap-2 rounded-xl bg-red-950 px-4 py-3 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-50"><Play className="h-4 w-4" />Quay 1 phiên</button>
          <button type="button" disabled={!parsed.bets.length || !validSettings || parsed.invalid.length > 0} onClick={runUntilHits} className="inline-flex items-center gap-2 rounded-xl border border-red-950 px-4 py-3 text-sm font-semibold text-red-950 hover:bg-red-50 disabled:opacity-50"><Timer className="h-4 w-4" />Theo dõi đến khi trúng</button>
          <button type="button" onClick={() => { setSession(null); setTracking([]); setTrackingCount(0); setTrackingComplete(false); }} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-600 hover:bg-stone-50"><RotateCcw className="h-4 w-4" />Xóa kết quả</button>
        </div>
      </section>

      {session && (
        <>
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-red-950">Kết quả một phiên · {new Date(session.createdAt).toLocaleString('vi-VN')}</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{session.results.map((result, index) => <div key={result.group + '-' + index} className={'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ' + (result.group === 'ĐB' ? 'bg-amber-50' : 'bg-stone-50')}><span className="text-xs font-semibold text-stone-600">{result.group} · {result.label}</span><span className="font-mono text-base font-bold tracking-wider text-red-950">{result.value}</span></div>)}</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {grouped.map(group => <div key={group.kind} className="rounded-xl bg-stone-50 p-3"><p className="text-xs font-semibold text-stone-600">{kindLabel[group.kind]}</p><p className="mt-1 text-sm">Cược: <strong>{money(group.stake)}</strong></p><p className="text-sm">Nhận: <strong>{money(group.returned)}</strong></p><p className="text-sm">Lãi/lỗ: <strong className={group.returned - group.stake >= 0 ? 'text-emerald-700' : 'text-red-700'}>{money(group.returned - group.stake)}</strong></p></div>)}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-red-50 p-3"><p className="text-xs text-stone-500">Tổng tiền đã cược</p><p className="mt-1 text-xl font-bold text-red-950">{money(totalStake)}</p></div>
              <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-stone-500">Tổng tiền trúng</p><p className="mt-1 text-xl font-bold text-emerald-800">{money(totalReturn)}</p></div>
              <div className="rounded-xl bg-stone-100 p-3"><p className="text-xs text-stone-500">Lãi / lỗ ròng</p><p className={'mt-1 text-xl font-bold ' + (totalReturn - totalStake >= 0 ? 'text-emerald-800' : 'text-red-800')}>{money(totalReturn - totalStake)}</p></div>
            </div>
            <p className="mt-3 text-xs text-stone-500">Số lượt trúng trong phiên: {hitTotal}. Lô được tính theo từng lần xuất hiện trong 27 đuôi giải; đề chỉ đối chiếu đuôi giải đặc biệt.</p>
          </section>
          <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-red-950">Chi tiết từng số đã ghi</h3>
            <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead><tr className="border-b text-xs text-stone-500"><th className="py-2 text-left">Hạng mục</th><th className="py-2 text-left">Số</th><th className="py-2 text-right">Mức ghi</th><th className="py-2 text-right">Số lần trúng</th><th className="py-2 text-right">Tiền nhận</th></tr></thead><tbody>{roundSummary.map(row => <tr key={row.bet.id} className="border-b border-stone-100"><td className="py-2.5">{kindLabel[row.bet.kind]}</td><td className="py-2.5 font-mono font-bold">{row.bet.number}</td><td className="py-2.5 text-right">{row.bet.kind.includes('loto') ? row.bet.amount + ' điểm' : money(row.bet.amount)}</td><td className="py-2.5 text-right">{row.hits}</td><td className="py-2.5 text-right font-semibold">{money(hitReturn(row.bet, row.hits, rates))}</td></tr>)}</tbody></table></div>
          </section>
        </>
      )}

      {tracking.length > 0 && (
        <section className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-serif text-lg font-bold text-red-950">Số kỳ cần chờ từng lựa chọn trúng</h3><span className="text-xs text-stone-500">Đã mô phỏng {trackingCount} ngày/kỳ · giới hạn {maxDraws}</span></div>
          <p className="mt-1 text-xs text-stone-500">{trackingComplete ? 'Tất cả lựa chọn đã trúng trong mô phỏng.' : 'Một số chưa trúng trong giới hạn mô phỏng; kết quả không có nghĩa là chắc chắn sẽ trúng sau đó.'}</p>
          <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead><tr className="border-b text-xs text-stone-500"><th className="py-2 text-left">Hạng mục</th><th className="py-2 text-left">Số</th><th className="py-2 text-right">Mức ghi</th><th className="py-2 text-right">Số kỳ chờ</th><th className="py-2 text-right">Ngày trúng đầu tiên</th></tr></thead><tbody>{tracking.map((row, index) => <tr key={row.bet.id + '-' + index} className="border-b border-stone-100"><td className="py-2.5">{kindLabel[row.bet.kind]}</td><td className="py-2.5 font-mono font-bold">{row.bet.number}</td><td className="py-2.5 text-right">{row.bet.kind.includes('loto') ? row.bet.amount + ' điểm' : money(row.bet.amount)}</td><td className="py-2.5 text-right font-semibold">{row.rounds ?? 'Chưa trúng'}</td><td className="py-2.5 text-right">{row.hitDate ?? '—'}</td></tr>)}</tbody></table></div>
        </section>
      )}

      <section className="rounded-2xl border border-amber-900/20 bg-amber-50/70 p-4"><p className="text-xs leading-5 text-amber-950">Đây là công cụ mô phỏng xác suất ngẫu nhiên, không dự đoán kết quả xổ số thực tế. Mỗi ngày trong phần theo dõi được tạo bằng một phiên XSMB độc lập; không sử dụng lịch sử để điều chỉnh kết quả.</p></section>
    </div>
  );
};
