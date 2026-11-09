import React, { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, ScrollText } from 'lucide-react';
import type { ChartCore } from '../engine/types.js';
import { makeReadingData, type GreatFortuneSelection } from '../ai/chart-data.js';
import { BRANCH_NAMES, mod } from '../engine/constants.js';
import greatFortunePrompt from '../promt_daivan.md?raw';
import personalFamilyPrompt from '../02-ban-than-va-gia-dinh.md?raw';
import lovePrompt from '../03-tinh-cam.md?raw';
import careerFinancePrompt from '../04-su-nghiep-tai-chinh.md?raw';
import environmentPrompt from '../05-quan-he-moi-truong.md?raw';
import healthPrompt from '../06-suc-khoe.md?raw';

const SECTIONS = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'key_areas', label: 'Các phương diện chính' },
  { id: 'great_fortune', label: 'Đại Vận' },
  { id: 'minor_fortune', label: 'Tiểu Vận' },
] as const;
type ReadingSection = typeof SECTIONS[number]['id'];
const TOPICS = [
  { id: 'personal_family', label: 'Bản thân & gia đình', prompt: personalFamilyPrompt },
  { id: 'love', label: 'Tình cảm & hôn nhân', prompt: lovePrompt },
  { id: 'career_finance', label: 'Sự nghiệp & tài chính', prompt: careerFinancePrompt },
  { id: 'environment', label: 'Quan hệ & môi trường', prompt: environmentPrompt },
  { id: 'health', label: 'Sức khỏe', prompt: healthPrompt },
] as const;
type TopicSection = typeof TOPICS[number]['id'];
interface CachedReading { text: string; savedAt: string; }
const CACHE_PREFIX = 'tuvi-reading-v2';
const READING_CONTEXT_VERSION = 'interpretation-db-1.4.0-prompt-v2';
const GREAT_FORTUNE_OUTPUT_VERSION = `system-instruction-markdown-v3-${READING_CONTEXT_VERSION}`;

function hash(value: string): string {
  // Hai hash độc lập để giữ khóa ngắn, ổn định giữa các lần mở app.
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x85ebca6b);
  }
  return `${(first >>> 0).toString(36)}-${(second >>> 0).toString(36)}`;
}

function loadCache(key: string): CachedReading | null {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    const parsed = JSON.parse(value) as CachedReading;
    return typeof parsed.text === 'string' && typeof parsed.savedAt === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-${index}`}>{part.replace(/`([^`]+)`/g, '$1')}</React.Fragment>;
  });
}

function renderReadingBlock(block: string, blockIndex: number): React.ReactNode {
  const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
  const headingPattern = /^(?:#{1,6}\s+|\*\*[^*]+\*\*\s*$)/;
  const bulletPattern = /^(?:[-*•]\s+|\d+[.)]\s+)/;
  const content: React.ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index]!;
    if (headingPattern.test(line)) {
      const heading = line.replace(/^#{1,6}\s+/, '').replace(/^\*\*|\*\*$/g, '');
      content.push(<h5 key={`h-${index}`} className="font-serif text-base font-bold text-oriental-crimson dark:text-amber-400">{renderInline(heading, `heading-${index}`)}</h5>);
      index++;
      continue;
    }
    if (bulletPattern.test(line)) {
      const items: string[] = [];
      while (index < lines.length && bulletPattern.test(lines[index]!)) {
        items.push(lines[index]!.replace(bulletPattern, ''));
        index++;
      }
      content.push(<ul key={`ul-${index}`} className="list-disc space-y-1 pl-6">{items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `li-${index}-${itemIndex}`)}</li>)}</ul>);
      continue;
    }
    const paragraphs: string[] = [];
    while (index < lines.length && !headingPattern.test(lines[index]!) && !bulletPattern.test(lines[index]!)) {
      paragraphs.push(lines[index]!);
      index++;
    }
    content.push(<p key={`p-${index}`}>{renderInline(paragraphs.join(' '), `p-${index}`)}</p>);
  }
  return <div key={blockIndex} className="space-y-2">{content}</div>;
}

export function ReadingPanel({ chart }: { chart: ChartCore }) {
  const [section, setSection] = useState<ReadingSection>('overview');
  const [topicSection, setTopicSection] = useState<TopicSection>('personal_family');
  const [selectedFortuneIndex, setSelectedFortuneIndex] = useState(chart.greatFortune?.decadeIndex ?? 0);
  const [text, setText] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const readingData = useMemo(() => makeReadingData(chart), [chart]);
  const chartKey = useMemo(() => hash(JSON.stringify(readingData)), [readingData]);
  const yangYear = chart.yearCanChi.stem % 2 === 0;
  const male = chart.input.gender === 'nam';
  const fortuneDirection: 1 | -1 = (yangYear && male) || (!yangYear && !male) ? 1 : -1;
  const fortuneOptions: GreatFortuneSelection[] = chart.menhBranch === undefined || chart.bureau === undefined
    ? []
    : Array.from({ length: 10 }, (_, decadeIndex) => {
      const startAge = chart.bureau!.number + decadeIndex * 10;
      return {
        direction: fortuneDirection,
        decadeIndex,
        startAge,
        endAge: startAge + 9,
        ...(chart.age >= startAge && chart.age <= startAge + 9 ? { yearInDecade: chart.age - startAge + 1 } : {}),
        branch: mod(chart.menhBranch! + fortuneDirection * decadeIndex),
      };
    });
  const selectedFortune = fortuneOptions.find(option => option.decadeIndex === selectedFortuneIndex);
  const requestedSection = section === 'key_areas' ? topicSection : section;
  const promptVersionFor = (requested: ReadingSection | TopicSection) => {
    if (requested === 'great_fortune') return hash(`${greatFortunePrompt}:${GREAT_FORTUNE_OUTPUT_VERSION}`);
    const topicPrompt = TOPICS.find(item => item.id === requested)?.prompt ?? '';
    return hash(`${READING_CONTEXT_VERSION}:${topicPrompt}`);
  };
  const cacheKeyFor = (requested: ReadingSection | TopicSection, fortuneIndex = selectedFortuneIndex) => {
    const cacheSection = requested === 'great_fortune' ? `${requested}-${fortuneIndex}` : requested;
    return `${CACHE_PREFIX}:${chartKey}:${cacheSection}:${promptVersionFor(requested)}`;
  };
  const cacheKey = cacheKeyFor(requestedSection);
  const sectionStorageKey = `${CACHE_PREFIX}:${chartKey}:last-section`;
  const selectedSection = SECTIONS.find(item => item.id === section)!;

  useEffect(() => {
    setSelectedFortuneIndex(chart.greatFortune?.decadeIndex ?? 0);
  }, [chart]);

  useEffect(() => {
    try {
      const savedValue = localStorage.getItem(`${CACHE_PREFIX}:${chartKey}:last-great-fortune`);
      const savedIndex = savedValue === null ? Number.NaN : Number(savedValue);
      if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < fortuneOptions.length) {
        setSelectedFortuneIndex(savedIndex);
      }
    } catch {
      // Default to the current decade when browser storage is unavailable.
    }
  }, [chartKey]);

  useEffect(() => {
    try {
      const savedSection = localStorage.getItem(sectionStorageKey);
      if (SECTIONS.some(item => item.id === savedSection)) setSection(savedSection as ReadingSection);
    } catch {
      // Section defaults to overview when browser storage is unavailable.
    }
  }, [sectionStorageKey]);

  useEffect(() => {
    const cached = loadCache(cacheKey);
    setText(cached?.text ?? '');
    setSavedAt(cached?.savedAt ?? null);
    setError('');
  }, [cacheKey]);

  const generate = async (targetSection: ReadingSection | TopicSection = requestedSection) => {
    if (targetSection === 'great_fortune' && !selectedFortune) {
      setError('Để luận giải Đại Vận, cần giờ sinh đủ rõ để xác định cung Mệnh.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/tuvi/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...makeReadingData(chart, targetSection === 'great_fortune' ? selectedFortune : undefined), section: targetSection }),
      });
      const result = await response.json() as { text?: string; error?: string };
      if (!response.ok) throw new Error(result.error || 'Yêu cầu luận giải thất bại.');
      const nextText = (result.text ?? 'Gemini chưa trả về nội dung.')
        .replace(/^\s*```(?:markdown)?\s*$/gmi, '')
        .trim();
      const nextSavedAt = new Date().toISOString();
      setText(nextText);
      setSavedAt(nextSavedAt);
      try {
      localStorage.setItem(cacheKeyFor(targetSection), JSON.stringify({ text: nextText, savedAt: nextSavedAt } satisfies CachedReading));
      } catch {
        setError('Đã tạo luận giải nhưng trình duyệt không lưu được cache. Nội dung sẽ mất khi đóng trang.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return <section className="space-y-4">
    <div role="tablist" aria-label="Mục luận giải" className="flex flex-wrap gap-2">
      {SECTIONS.map(item => {
        const itemCacheSection = item.id === 'great_fortune' ? `great_fortune-${selectedFortuneIndex}` : item.id;
        const itemPromptVersion = promptVersionFor(item.id);
        const cached = loadCache(`${CACHE_PREFIX}:${chartKey}:${itemCacheSection}:${itemPromptVersion}`);
        return <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={section === item.id}
          disabled={loading}
          onClick={() => {
            setSection(item.id);
            try { localStorage.setItem(sectionStorageKey, item.id); } catch { /* optional preference */ }
          }}
          className={`tab ${section === item.id ? 'border-red-800 text-red-950 dark:text-red-300' : ''}`}
        >
          {item.label}{cached ? ' · Đã lưu' : ''}
        </button>;
      })}
    </div>

    {section === 'great_fortune' && <div className="paper-inset p-4">
      <label htmlFor="great-fortune-age" className="mb-2 block text-sm font-semibold text-stone-800 dark:text-slate-200">Chọn khoảng tuổi Đại Vận</label>
      {fortuneOptions.length > 0 ? <select
        id="great-fortune-age"
        value={selectedFortuneIndex}
        disabled={loading}
        onChange={event => {
          const index = Number(event.target.value);
          setSelectedFortuneIndex(index);
          try { localStorage.setItem(`${CACHE_PREFIX}:${chartKey}:last-great-fortune`, String(index)); } catch { /* optional preference */ }
        }}
        className="w-full rounded-lg border border-amber-900/20 bg-white px-3 py-2 text-sm text-stone-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:max-w-xs"
      >
        {fortuneOptions.map(option => <option key={option.decadeIndex} value={option.decadeIndex}>
          {option.startAge}–{option.endAge} tuổi · Cung {BRANCH_NAMES[option.branch]} (gốc: {chart.palaces.find(palace => palace.branch === option.branch)?.name ?? 'chưa rõ'})
        </option>)}
      </select> : <p className="text-sm text-amber-800 dark:text-amber-300">Chưa xác định được cung Mệnh; cần bổ sung giờ sinh để chọn Đại Vận.</p>}
    </div>}

    {section === 'key_areas' && <div role="tablist" aria-label="Phương diện luận giải" className="flex flex-wrap gap-2">
      {TOPICS.map(item => {
        const cached = loadCache(cacheKeyFor(item.id));
        return <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={topicSection === item.id}
          disabled={loading}
          onClick={() => {
            setTopicSection(item.id);
          }}
          className={`tab ${topicSection === item.id ? 'border-red-800 text-red-950 dark:text-red-300' : ''}`}
        >
          {item.label}{cached ? ' · Đã lưu' : ''}
        </button>;
      })}
    </div>}

    <div className="paper-inset p-4">
      <div className="flex items-center gap-2.5 font-serif text-base font-bold text-oriental-crimson dark:text-amber-400">
        <ScrollText className="h-5 w-5 text-red-800" aria-hidden="true" />
        <h4>Luận giải: {section === 'key_areas' ? TOPICS.find(item => item.id === topicSection)?.label : selectedSection.label}</h4>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-slate-300">
        Kết quả được lưu trên trình duyệt này theo lá số và mục luận giải. Ngày giờ sinh, giới tính và năm xem cũng được lưu cục bộ để khôi phục lá số; tên không được lưu. Khi mở lại, nội dung đã tạo sẽ hiện từ cache.
      </p>
      {savedAt && <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">Đã lưu lúc {new Date(savedAt).toLocaleString('vi-VN')}</p>}
      <button type="button" onClick={() => void generate()} disabled={loading} className="btn btn-primary mt-3 disabled:cursor-wait">
        {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? 'Đang luận giải…' : text ? 'Tạo lại luận giải' : 'Tạo luận giải'}
      </button>
    </div>

    {loading && <div role="status" aria-live="polite" className="paper-card flex items-center justify-center gap-3 p-8 text-sm text-stone-600 dark:text-slate-300">
      <LoaderCircle className="h-5 w-5 animate-spin text-red-800" /> Gemini đang phân tích dữ liệu cho mục này…
    </div>}

    {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">{error}</p>}

    {text && <article className="paper-card space-y-4 p-6 text-[15px] leading-8 text-stone-800 dark:text-slate-200">
      {text.trim().split(/\n\s*\n+/).filter(Boolean).map(renderReadingBlock)}
    </article>}
  </section>;
}
