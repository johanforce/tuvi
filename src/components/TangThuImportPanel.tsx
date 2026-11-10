import React, { useRef, useState } from 'react';
import { FileUp, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { importArticlesToFirestore } from '../services/firebase.js';

type ImportRecord = {
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  sourceUrl: string;
  summary?: string;
  sourceType?: string;
  createdAt?: string;
};

interface Props {
  onImported: () => Promise<void> | void;
}

export const TangThuImportPanel: React.FC<Props> = ({ onImported }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<ImportRecord[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    setResult('');
    try {
      const parsed = JSON.parse(await file.text());
      const list = Array.isArray(parsed) ? parsed : parsed.articles;
      if (!Array.isArray(list)) throw new Error('JSON phải có thuộc tính articles dạng mảng.');
      const valid = list.filter((item: any) =>
        item && typeof item.title === 'string' &&
        typeof item.content === 'string' &&
        typeof item.sourceUrl === 'string'
      ).map((item: any) => ({
        title: item.title,
        content: item.content,
        sourceUrl: item.sourceUrl,
        summary: typeof item.summary === 'string' ? item.summary : '',
        category: typeof item.category === 'string' ? item.category : 'Tử Vi',
        tags: Array.isArray(item.tags) ? item.tags.map(String) : ['Tử Vi', 'Tàng Thư'],
        author: typeof item.author === 'string' ? item.author : 'Chưa xác định',
        sourceType: typeof item.sourceType === 'string' ? item.sourceType : 'external-import',
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      }));
      const unique = [...new Map(valid.map((item: ImportRecord) => [item.sourceUrl, item])).values()];
      setRecords(unique);
      setFileName(file.name);
      if (!unique.length) setError('Không tìm thấy bài viết hợp lệ trong file.');
    } catch (err) {
      setRecords([]);
      setFileName('');
      setError(err instanceof Error ? err.message : 'Không đọc được file JSON.');
    }
  };

  const handleImport = async () => {
    if (!records.length || busy) return;
    if (!window.confirm(`Nhập/cập nhật ${records.length} bài theo URL nguồn? Bản ghi cùng URL sẽ được cập nhật, không tạo bản trùng.`)) return;
    setBusy(true);
    setError('');
    setResult('');
    try {
      const summary = await importArticlesToFirestore(records);
      await onImported();
      setResult(`Hoàn tất: ${summary.inserted} bài mới, ${summary.updated} bài cập nhật, ${summary.skipped} bài bị bỏ qua do thiếu/sai dữ liệu hoặc vượt giới hạn.`);
      setRecords([]);
      setFileName('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể nhập dữ liệu vào Firestore.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-red-950">Nhập hàng loạt bài viết</h3>
          <p className="mt-1 text-xs leading-5 text-stone-600">Chọn file JSON do scripts/crawl_tang_thu.py tạo ra. Chỉ tài khoản admin mới được ghi.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={event => void handleFile(event.target.files?.[0])}
          />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-red-900/20 bg-white px-3 py-2 text-xs font-semibold text-red-950 hover:bg-red-50 disabled:opacity-50">
            <FileUp className="h-4 w-4" /> Chọn file JSON
          </button>
          <button type="button" onClick={() => void handleImport()} disabled={busy || records.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-red-950 px-3 py-2 text-xs font-semibold text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {busy ? 'Đang nhập...' : `Nhập ${records.length || ''} bài`}
          </button>
        </div>
      </div>
      {fileName && <p className="mt-3 text-xs text-stone-700">File: <strong>{fileName}</strong> · {records.length} bản ghi hợp lệ đã đọc</p>}
      {error && <p role="alert" className="mt-3 flex items-start gap-2 text-xs text-red-800"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</p>}
      {result && <p role="status" className="mt-3 text-xs font-medium text-emerald-800">{result}</p>}
      <p className="mt-3 text-[11px] leading-5 text-stone-500">Lưu ý: bài thiếu nội dung, URL nguồn, hoặc vượt giới hạn Firestore sẽ bị bỏ qua. Hãy rà soát tác giả và trích dẫn trước khi công khai.</p>
    </section>
  );
};
