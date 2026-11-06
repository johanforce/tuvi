import React, { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { ChartCore } from '../engine/types.js';
import { makeReadingData } from '../ai/chart-data.js';

export function ReadingPanel({ chart }: { chart: ChartCore }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError('');
    setText('');
    try {
      const response = await fetch('/api/tuvi/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(makeReadingData(chart)),
      });
      const result = await response.json() as { text?: string; error?: string };
      if (!response.ok) throw new Error(result.error || 'Yêu cầu luận giải thất bại.');
      setText(result.text ?? 'Gemini chưa trả về nội dung.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return <section className="space-y-4">
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h4 className="font-bold text-[#8c2d19]">Luận giải tổng quan với Gemini 3.5 Flash</h4>
      <p className="mt-1 text-sm text-stone-700">Chỉ dữ liệu cung, vị trí sao và thông tin kỹ thuật của lá số được gửi để luận giải. Tên, ngày giờ sinh, giới tính và tuổi không được gửi.</p>
      <button type="button" onClick={generate} disabled={loading} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#8c2d19] px-4 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
        {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? 'Đang luận giải…' : 'Tạo luận giải'}
      </button>
    </div>
    {loading && <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white p-8 text-sm text-stone-600">
      <LoaderCircle className="h-5 w-5 animate-spin text-[#8c2d19]" /> Gemini đang phân tích các cung và sao…
    </div>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {text && <article className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 text-[15px] leading-8 text-stone-800">
      {text.trim().split(/\n\s*\n+/).filter(Boolean).map((paragraph, index) => (
        <p key={index}>{paragraph.replace(/\n/g, ' ')}</p>
      ))}
    </article>}
  </section>;
}
