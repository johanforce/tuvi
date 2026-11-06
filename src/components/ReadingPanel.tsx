import React, { useState } from 'react';
import { LoaderCircle, ScrollText } from 'lucide-react';
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
    <div className="paper-inset p-4">
      <div className="flex items-center gap-2.5 font-serif text-base font-bold text-oriental-crimson dark:text-amber-400">
        <ScrollText className="h-5 w-5 text-amber-600" aria-hidden="true" />
        <h4>Luận giải tổng quan với Gemini 3.5 Flash</h4>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-slate-300">Chỉ dữ liệu cung, vị trí sao và thông tin kỹ thuật của lá số được gửi để luận giải. Tên, ngày giờ sinh, giới tính và tuổi không được gửi.</p>
      <button type="button" onClick={generate} disabled={loading} className="btn btn-primary mt-3 disabled:cursor-wait">
        {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? 'Đang luận giải…' : 'Tạo luận giải'}
      </button>
    </div>

    {loading && <div role="status" aria-live="polite" className="paper-card flex items-center justify-center gap-3 p-8 text-sm text-stone-600 dark:text-slate-300">
      <LoaderCircle className="h-5 w-5 animate-spin text-amber-700" /> Gemini đang phân tích các cung và sao…
    </div>}

    {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">{error}</p>}

    {text && <article className="paper-card space-y-4 p-6 text-[15px] leading-8 text-stone-800 dark:text-slate-200">
      {text.trim().split(/\n\s*\n+/).filter(Boolean).map((paragraph, index) => (
        <p key={index} className={index === 0 ? 'first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.9] first-letter:text-oriental-crimson dark:first-letter:text-amber-400' : ''}>
          {paragraph.replace(/\n/g, ' ')}
        </p>
      ))}
    </article>}
  </section>;
}
