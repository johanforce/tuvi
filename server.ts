import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json({ limit: '256kb' }));

const XSMB_SOURCE_URL = 'https://raw.githubusercontent.com/khiemdoan/vietnam-lottery-xsmb-analysis/main/data/xsmb-2-digits.csv';
const XSMB_SOURCE_NAME = 'Khiem Doan — Vietnam Lottery XSMB Analysis';
const XSMB_CACHE_MS = 30 * 60 * 1000;

interface XsmbApiDraw {
  date: string;
  special: string;
  loto: string[];
}

interface XsmbApiCache {
  checkedAt: string;
  fetchedAt: number;
  draws: XsmbApiDraw[];
}

let xsmbApiCache: XsmbApiCache | null = null;

function normalizeXsmbValue(value: string): string | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 99
    ? String(parsed).padStart(2, '0')
    : null;
}

function parseXsmbCsv(csv: string): XsmbApiDraw[] {
  const lines = csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const header = lines[0]?.split(',');
  if (!header || header.length !== 28 || header[0] !== 'date') {
    throw new Error('Cấu trúc CSV XSMB từ nguồn không đúng định dạng mong đợi.');
  }

  const byDate = new Map<string, XsmbApiDraw>();
  for (const line of lines.slice(1)) {
    const columns = line.split(',');
    if (columns.length !== 28 || !/^\d{4}-\d{2}-\d{2}$/.test(columns[0])) continue;
    const values = columns.slice(1).map(normalizeXsmbValue);
    if (values.some(value => value === null)) continue;
    const date = columns[0];
    byDate.set(date, {
      date,
      special: values[0]!,
      loto: values as string[],
    });
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function validateXsmbSnapshot(value: unknown): XsmbApiDraw[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { draws?: unknown }).draws)) {
    throw new Error('Bản dữ liệu XSMB dự phòng không hợp lệ.');
  }
  const draws = (value as { draws: unknown[] }).draws;
  const valid = draws.filter((item): item is XsmbApiDraw => {
    if (!item || typeof item !== 'object') return false;
    const draw = item as Partial<XsmbApiDraw>;
    return typeof draw.date === 'string'
      && /^\d{4}-\d{2}-\d{2}$/.test(draw.date)
      && typeof draw.special === 'string'
      && /^\d{2}$/.test(draw.special)
      && Array.isArray(draw.loto)
      && draw.loto.length === 27
      && draw.loto.every(number => typeof number === 'string' && /^\d{2}$/.test(number));
  });
  if (valid.length !== draws.length || valid.length < 1) {
    throw new Error('Bản dữ liệu XSMB dự phòng có dòng sai định dạng.');
  }
  return valid.sort((a, b) => a.date.localeCompare(b.date));
}

app.get('/api/xsmb/results', async (req, res) => {
  const requestedDays = Number(req.query.days ?? 100);
  const days = Number.isInteger(requestedDays) ? Math.max(1, Math.min(100, requestedDays)) : 100;
  const forceRefresh = req.query.refresh === '1';
  const now = Date.now();

  try {
    if (!forceRefresh && xsmbApiCache && now - xsmbApiCache.fetchedAt < XSMB_CACHE_MS) {
      const draws = xsmbApiCache.draws.slice(-days);
      res.json({
        source: 'live',
        sourceName: XSMB_SOURCE_NAME,
        sourceUrl: XSMB_SOURCE_URL,
        checkedAt: xsmbApiCache.checkedAt,
        startDate: draws[0]?.date ?? '',
        endDate: draws[draws.length - 1]?.date ?? '',
        drawCount: draws.length,
        draws,
      });
      return;
    }

    const upstream = await fetch(XSMB_SOURCE_URL, {
      headers: { Accept: 'text/csv', 'User-Agent': 'TuVi-CoHoc-XSMB/1.0' },
      signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) throw new Error('Nguồn XSMB trả về HTTP ' + upstream.status + '.');
    const parsed = parseXsmbCsv(await upstream.text());
    if (parsed.length < 100) throw new Error('Nguồn XSMB chưa có đủ 100 kỳ hợp lệ.');
    xsmbApiCache = { checkedAt: new Date().toISOString(), fetchedAt: now, draws: parsed.slice(-100) };

    const draws = xsmbApiCache.draws.slice(-days);
    res.json({
      source: 'live',
      sourceName: XSMB_SOURCE_NAME,
      sourceUrl: XSMB_SOURCE_URL,
      checkedAt: xsmbApiCache.checkedAt,
      startDate: draws[0]?.date ?? '',
      endDate: draws[draws.length - 1]?.date ?? '',
      drawCount: draws.length,
      draws,
    });
  } catch (error) {
    try {
      const snapshot = JSON.parse(await readFile(resolve('data/xsmb/100-days.json'), 'utf8')) as unknown;
      const allDraws = validateXsmbSnapshot(snapshot);
      const draws = allDraws.slice(-days);
      res.json({
        source: 'snapshot',
        sourceName: XSMB_SOURCE_NAME + ' (bản chụp dự phòng trong repo)',
        sourceUrl: XSMB_SOURCE_URL,
        checkedAt: new Date().toISOString(),
        startDate: draws[0]?.date ?? '',
        endDate: draws[draws.length - 1]?.date ?? '',
        drawCount: draws.length,
        draws,
        notice: 'Không tải được nguồn trực tiếp: ' + (error instanceof Error ? error.message : 'lỗi không xác định') + ' Đang dùng bản chụp dữ liệu thật có trong repo.',
      });
    } catch (snapshotError) {
      res.status(503).json({
        error: 'Không tải được nguồn XSMB trực tiếp và bản dữ liệu dự phòng cũng không đọc được.',
        details: snapshotError instanceof Error ? snapshotError.message : 'Lỗi không xác định',
      });
    }
  }
});


const BRANCH_NAMES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

const GEMINI_SKILL_VERSION = '1.1.0-gemini';
const GEMINI_SKILL_BASE_FILES = [
  'gemini_skill/GEMINI_INSTRUCTIONS.md',
  'gemini_skill/SKILL.md',
  'gemini_skill/references/INPUT_AND_CHART_SCHEMA.md',
  'gemini_skill/references/REASONING_ENGINE.md',
  'gemini_skill/references/PALACE_CROSS_REFERENCE.md',
  'gemini_skill/references/LUCK_CYCLE_ENGINE.md',
  'gemini_skill/references/SOURCE_POLICY.md',
  'gemini_skill/references/OUTPUT_CONTRACT.md',
  'gemini_skill/references/DATABASE_INTEGRATION.md',
  'gemini_skill/references/CASE_VALIDATION_PROTOCOL.md',
  'gemini_skill/references/PROMPT_LIBRARY.md',
] as const;

/** Đọc và kiểm tra toàn bộ bundle skill từ thư mục gốc của project. */
async function inspectGeminiSkillRuntime() {
  const results = await Promise.all(GEMINI_SKILL_BASE_FILES.map(async path => {
    try {
      const content = await readFile(resolve(process.cwd(), path), 'utf8');
      return { path, content, loaded: true as const };
    } catch {
      return { path, content: '', loaded: false as const };
    }
  }));
  const files = results.map(({ path, loaded, content }) => ({ path, loaded, characters: content.length }));
  const missing = files.filter(file => !file.loaded).map(file => file.path);
  return {
    version: GEMINI_SKILL_VERSION,
    ready: missing.length === 0,
    files,
    missing,
    totalCharacters: results.reduce((sum, item) => sum + item.content.length, 0),
    documents: results.filter(item => item.loaded).map(({ path, content }) => ({ path, content })),
  };
}

/** Không gửi yêu cầu luận giải nếu bundle skill chưa nạp đủ. */
async function loadGeminiSkillInstructions(section: string): Promise<{ instructions: string; runtime: { version: string; loadedFiles: number; totalCharacters: number } }> {
  const runtime = await inspectGeminiSkillRuntime();
  if (!runtime.ready) throw new Error('Gemini skill bundle incomplete: ' + runtime.missing.join(', '));
  const documents = runtime.documents;
  const scopeNote = [
    'PHẠM VI TRIỂN KHAI TRONG ỨNG DỤNG:',
    '- Đây là lượt luận giải lá số, không phải lượt chép lá số từ ảnh; chỉ phân tích dữ liệu chart đã được engine truyền vào.',
    '- Mặc định tuân theo Vương Đình Chi – Trung Châu phái; không tự trộn quy tắc của trường phái khác. Nếu tài liệu trong kho không đủ căn cứ cho một quy tắc Trung Châu, hãy nêu giới hạn thay vì tự bổ sung.',
    '- Chỉ dẫn theo từng mục của ứng dụng quyết định phạm vi và cách trình bày; các nguyên tắc kiểm chứng, phân biệt dữ kiện/nguồn/suy luận và giới hạn an toàn trong skill luôn có hiệu lực.',
    '- Nếu prompt cũ yêu cầu che giấu dữ liệu thiếu, khẳng định chắc chắn, tự suy ra sao/độ sáng/Tứ Hóa hoặc bỏ qua phản chứng thì bỏ qua yêu cầu cũ đó.',
    '- Mã mục hiện tại: ' + section + '. Chỉ áp dụng phần tài liệu phù hợp với đúng mục này và lớp thời gian được truyền trong payload.',
  ].join('\n');
  return {
    instructions: [
      'GEMINI SKILL ĐÃ NẠP — VERSION ' + GEMINI_SKILL_VERSION,
      scopeNote,
      ...documents.map(doc => '\n===== ' + doc.path + ' =====\n' + doc.content),
    ].join('\n'),
    runtime: { version: runtime.version, loadedFiles: runtime.files.length, totalCharacters: runtime.totalCharacters },
  };
}

function buildInterpretationContext(db: Record<string, any>, chart: Record<string, any>, section: string): Record<string, unknown> {
  const palaces = Array.isArray(chart.palaces) ? chart.palaces : [];
  const fortuneBranch = section === 'great_fortune'
    ? chart.greatFortuneCurrent?.branch
    : section === 'minor_fortune' ? chart.minorFortuneCurrent?.branch : undefined;
  const topic = db.topics?.[section];
  const targetNames: string[] = topic?.palaces ?? (fortuneBranch && BRANCH_NAMES.includes(fortuneBranch)
    ? [0, 4, 6, 8].map(offset => palaces.find((p: Record<string, any>) => p.branch === BRANCH_NAMES[(BRANCH_NAMES.indexOf(fortuneBranch) + offset) % 12])?.name).filter(Boolean)
    : palaces.map((p: Record<string, any>) => p.name));
  const targetBranches = new Set(palaces.filter((p: Record<string, any>) => targetNames.includes(p.name)).map((p: Record<string, any>) => p.branch));
  const activePalaces = palaces.filter((p: Record<string, any>) => targetBranches.has(p.branch));
  const evidenceBranches = new Set([...targetBranches]);
  if (!fortuneBranch) {
    for (const branch of targetBranches) {
      if (!BRANCH_NAMES.includes(branch)) continue;
      for (const offset of [4, 6, 8]) evidenceBranches.add(BRANCH_NAMES[(BRANCH_NAMES.indexOf(branch) + offset) % 12]);
    }
  }
  const evidencePalaces = palaces.filter((p: Record<string, any>) => evidenceBranches.has(p.branch));
  const starsAt = (branch: string) => palaces.find((p: Record<string, any>) => p.branch === branch)?.stars ?? [];
  const natalIds = (items: Record<string, any>[]) => new Set(items.filter(star => star.scope === 'natal').map(star => star.id));
  const ruleTopics = topic ? new Set([section]) : null;

  const rules = (db.rules ?? []).filter((rule: Record<string, any>) => {
    if (ruleTopics && rule.topic !== section) return false;
    if (!activePalaces.some((palace: Record<string, any>) => palace.name === rule.palace && rule.starIds?.some((id: string) => natalIds(palace.stars ?? []).has(id)))) return false;
    return true;
  });

  const combinationRules = (db.combinationRules ?? []).filter((rule: Record<string, any>) => {
    if (ruleTopics && rule.topic !== section) return false;
    return activePalaces.some((palace: Record<string, any>) => {
      if (!rule.palaces?.includes(palace.name) || !BRANCH_NAMES.includes(palace.branch)) return false;
      const offsets = rule.scope === 'same_palace' ? [0] : rule.scope === 'tam_phuong' ? [0, 4, 8] : [0, 4, 6, 8];
      const ids = new Set(offsets.flatMap(offset => [...natalIds(starsAt(BRANCH_NAMES[(BRANCH_NAMES.indexOf(palace.branch) + offset) % 12]))]));
      return rule.starIds?.every((id: string) => ids.has(id));
    });
  });

  const starCombinations = (db.starCombinations ?? []).filter((combo: Record<string, any>) =>
    evidencePalaces.some((palace: Record<string, any>) => {
      const ids = natalIds(palace.stars ?? []);
      return (!combo.branches || combo.branches.includes(palace.branch)) && combo.starIds?.every((id: string) => ids.has(id));
    }));
  const observedStars = new Set(evidencePalaces.flatMap((palace: Record<string, any>) => (palace.stars ?? []).map((star: Record<string, any>) => star.id)));
  const observedAnnualStars = new Set(evidencePalaces.flatMap((palace: Record<string, any>) => (palace.stars ?? []).filter((star: Record<string, any>) => star.scope === 'annual').map((star: Record<string, any>) => star.id?.replace(/-\d+$/, ''))));
  const selectObserved = (profiles: Record<string, unknown> = {}, ids: Set<string> = observedStars) =>
    Object.fromEntries(Object.entries(profiles).filter(([id]) => ids.has(id)));

  return {
    database: { title: db.title, version: db.version, description: db.description, interpretivePrinciples: db.interpretivePrinciples, sources: db.sources },
    topic: topic ? { id: section, ...topic } : null,
    scope: { targetPalaces: [...new Set(targetNames)], fortune: section === 'great_fortune' ? chart.greatFortuneCurrent ?? null : undefined },
    starClasses: db.starClasses,
    palaceProfiles: db.palaceProfiles,
    starProfiles: selectObserved(db.starProfiles),
    starPalaceProfiles: Object.fromEntries(Object.entries(db.starPalaceProfiles ?? {}).filter(([id]) => observedStars.has(id))),
    transformationProfiles: selectObserved(db.transformationProfiles),
    transformationPalaceProfiles: selectObserved(db.transformationPalaceProfiles),
    annualStarProfiles: section === 'great_fortune' || topic ? {} : selectObserved(db.annualStarProfiles, observedAnnualStars),
    palaceModifiers: db.palaceModifiers,
    rules,
    combinationRules,
    starCombinations,
    greatFortune: section === 'great_fortune' ? db.greatFortune : undefined,
  };
}

app.post('/api/bac-de/reading', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm API key trong Settings > Secrets của AI Studio.' });
    return;
  }

  const number = Number(req.body?.number);
  if (!Number.isInteger(number) || number < 1 || number > 51) {
    res.status(400).json({ error: 'Số quẻ phải nằm trong khoảng 1–51.' });
    return;
  }

  try {
    const cardList = JSON.parse(await readFile(resolve('src/51_que_bac_de.json'), 'utf8')) as Array<Record<string, any>>;
    const card = cardList.find(item => item.id === number);
    if (!card) {
      res.status(404).json({ error: `Chưa có dữ liệu cho quẻ số ${number}.` });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Hãy luận giải thẻ Bắc Đế đền Hệ số ${number} dựa riêng trên dữ liệu thẻ bên dưới. Nêu ý chính của bài thơ, liên hệ tích quẻ và các phương diện có dữ liệu. Giải thích lời khuyên bằng tiếng Việt hiện đại, rõ ràng, có phần thuận lợi, điều nên thận trọng và gợi ý ứng xử thực tế. Phân biệt nội dung nguyên bản với phần diễn giải của bạn; không khẳng định tương lai chắc chắn, không tự thêm dữ liệu không có trong thẻ. Với phần đoán bệnh, chỉ tóm lược nội dung văn bản cổ và khuyên tìm chuyên gia y tế, không chẩn đoán hoặc thay tư vấn điều trị. Trình bày bằng Markdown ngắn gọn, dễ đọc.\n\nDỮ LIỆU THẺ:\n${JSON.stringify({ id: card.id, rating: card.rating, title: card.title, tich: card.tich, thi: card.thi, sections: card.sections })}`,
    });
    res.json({ text: response.text ?? '' });
  } catch (error) {
    console.error('Bắc Đế reading request failed:', error instanceof Error ? error.message : 'unknown error');
    res.status(502).json({ error: 'Không thể tạo luận giải lúc này. Vui lòng thử lại.' });
  }
});

app.get('/api/tuvi/skill-status', async (_req, res) => {
  const runtime = await inspectGeminiSkillRuntime();
  res.status(runtime.ready ? 200 : 503).json({
    version: runtime.version,
    ready: runtime.ready,
    files: runtime.files,
    missing: runtime.missing,
    totalCharacters: runtime.totalCharacters,
  });
});

app.post('/api/tuvi/reading', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm API key trong Settings > Secrets của AI Studio.' });
    return;
  }

  const input = req.body;
  if (!input || typeof input !== 'object' || !input.chart || !Array.isArray(input.chart.palaces)) {
    res.status(400).json({ error: 'Dữ liệu cung và sao không hợp lệ.' });
    return;
  }
  const sectionInstructions: Record<string, string> = {
    overview: 'CHỈ DẪN RIÊNG NÀY ƯU TIÊN NẾU MÂU THUẪN VỚI YÊU CẦU ĐỊNH DẠNG KHÁC. MỤC: TỔNG QUAN. Khái quát các xu hướng có căn cứ trong dữ liệu, nêu điểm thuận lợi, điểm cần lưu tâm và gợi ý thực tế. Không đi sâu thành các mục luận giải chuyên biệt.',
    key_areas: 'CHỈ DẪN RIÊNG NÀY ƯU TIÊN NẾU MÂU THUẪN VỚI YÊU CẦU ĐỊNH DẠNG KHÁC. MỤC: CÁC PHƯƠNG DIỆN CHÍNH. Trình bày thành các đoạn riêng, mở đầu bằng tên phương diện: bản thân và cách quyết định, công việc và phát triển, tài chính, tình cảm và quan hệ, gia đình. Bỏ qua phương diện không đủ căn cứ; không suy đoán sức khỏe hoặc biến cố.',
    great_fortune: 'Luận đúng Đại Vận do người dùng chọn trong greatFortuneCurrent; tuyệt đối không thay bằng vận hiện tại theo năm xem. Dùng khoảng tuổi, cung vận và cung chức năng gốc đã gửi. Mặc định dữ liệu được cung cấp là chính xác; không đề cập đến kiểm chứng hoặc thiếu dữ liệu. Không tự tạo thêm sao hay Tứ Hóa không có trong dữ liệu.',
    minor_fortune: 'CHỈ DẪN RIÊNG NÀY ƯU TIÊN NẾU MÂU THUẪN VỚI YÊU CẦU ĐỊNH DẠNG KHÁC. MỤC: TIỂU VẬN NĂM ĐANG XEM. Tập trung vào vị trí Tiểu Hạn và dữ liệu sao lưu niên của năm xem. Phân biệt xu hướng năm với tính chất bản mệnh; không khẳng định sự kiện cụ thể. Nếu thiếu dữ liệu an sao lưu hoặc các yếu tố vận hạn, hãy nói rõ giới hạn.',
  };
  const topicPromptFiles: Record<string, string> = {
    personal_family: 'src/02-ban-than-va-gia-dinh.md',
    love: 'src/03-tinh-cam.md',
    career_finance: 'src/04-su-nghiep-tai-chinh.md',
    environment: 'src/05-quan-he-moi-truong.md',
    health: 'src/06-suc-khoe.md',
  };
  const section = input.section;
  if (typeof section !== 'string' || (!Object.hasOwn(sectionInstructions, section) && !Object.hasOwn(topicPromptFiles, section))) {
    res.status(400).json({ error: 'Mục luận giải không hợp lệ.' });
    return;
  }
  const isTopicReading = Object.hasOwn(topicPromptFiles, section);

  // Forward only the chart whitelist; personal fields sent accidentally are discarded.
  const chart = input.chart;
  const chartData = {
    viewedYear: chart.viewedYear,
    viewedYearCanChi: chart.viewedYearCanChi,
    menhBranch: chart.menhBranch,
    thanBranch: chart.thanBranch,
    menhChu: chart.menhChu,
    thanChu: chart.thanChu,
    bureau: chart.bureau,
    greatFortuneCurrent: isTopicReading ? null : chart.greatFortuneCurrent,
    minorFortuneCurrent: isTopicReading ? null : chart.minorFortuneCurrent,
    tuanBranches: chart.tuanBranches,
    trietBranches: chart.trietBranches,
    annualPendingStars: section === 'great_fortune' || isTopicReading ? [] : chart.annualPendingStars,
    engineWarnings: section === 'great_fortune' || isTopicReading ? [] : chart.engineWarnings,
    knownLimits: section === 'great_fortune' || isTopicReading ? [] : [
      'Các công thức an sao đã được người dùng xác nhận.',
      'Một số sao chưa có bảng độ sáng đầy đủ.',
      'Đại Hạn và Tiểu Hạn hiện được cung cấp theo vị trí cung; không có danh sách sao hoặc Tứ Hóa riêng cho từng tầng vận.',
    ],
    palaces: chart.palaces.map((palace: Record<string, any>) => ({
      name: palace.name,
      branch: palace.branch,
      canChi: palace.canChi,
      isMenh: palace.isMenh,
      isThan: palace.isThan,
      hasTuan: palace.hasTuan,
      hasTriet: palace.hasTriet,
      stars: Array.isArray(palace.stars) ? palace.stars.filter((star: Record<string, any>) => !isTopicReading || star.scope === 'natal').map((star: Record<string, any>) => section === 'great_fortune' ? {
        id: star.id,
        name: star.name,
        scope: star.scope,
        ...(star.brightness ? { brightness: star.brightness } : {}),
      } : {
        id: star.id,
        name: star.name,
        scope: star.scope,
        status: star.status,
        note: star.note,
        brightness: star.brightness,
        brightnessStatus: star.brightnessStatus,
      }) : [],
    })),
  };

  try {
    const promptFile = section === 'great_fortune'
      ? 'src/promt_daivan.md'
      : topicPromptFiles[section] ?? 'src/promt_tongquat.md';
    const prompt = await readFile(resolve(promptFile), 'utf8');
    const interpretationDb = JSON.parse(await readFile(resolve('src/data/ziwei-interpretation-db.json'), 'utf8')) as Record<string, any>;
    const interpretationContext = buildInterpretationContext(interpretationDb, chartData, section);
    const sectionInstruction = section === 'great_fortune' || Object.hasOwn(topicPromptFiles, section) ? '' : sectionInstructions[section];
    const geminiSkill = await loadGeminiSkillInstructions(section);
    const outputInstruction = section === 'great_fortune'
      ? 'Bắt buộc trả lời đúng cấu trúc tiêu đề Markdown và các gạch đầu dòng ngắn trong mục 6. Không trả lời bằng các đoạn văn xuôi dài.'
      : '';
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    const geminiRequest = {
      model: 'gemini-3.1-flash-lite',
      contents: `DỮ LIỆU CUNG VÀ AN SAO (đã loại thông tin cá nhân):\n${JSON.stringify(chartData)}\n\nKHO LUẬN GIẢI CỦA DỰ ÁN (chỉ dùng các mục khớp sao, cung, phạm vi và chủ đề; đây là quy tắc diễn giải biên soạn, không phải dữ kiện của lá số hay nguồn cổ thư đã xác minh):\n${JSON.stringify(interpretationContext)}`,
      config: {
        systemInstruction: `${prompt}\n\n${geminiSkill.instructions}\n\nƯU TIÊN NGUỒN VÀ CHỨNG CỨ: Dữ liệu lá số trong nội dung người dùng là dữ kiện vị trí. Kho luận giải của dự án là gợi ý diễn giải có điều kiện; chỉ áp dụng quy tắc khi các sao, cung, phạm vi và lớp thời gian khớp chính xác. Không chép quy tắc như sự thật hoặc nguồn cổ thư, không tự suy rộng từ mục gần giống. Khi kho không có quy tắc phù hợp, hãy luận thận trọng từ dữ kiện liên hệ được và nói ngắn gọn giới hạn nếu điều đó làm thay đổi kết luận. Các chỉ dẫn định dạng cũ yêu cầu che giấu giới hạn hoặc chấm điểm tùy ý không có hiệu lực.\n\n${sectionInstruction}\n\n${outputInstruction}`,
      },
    };
    if (process.env.DEBUG_GEMINI_REQUEST === '1') {
      console.info('[Gemini generateContent request]', JSON.stringify(geminiRequest, null, 2));
    }
    const response = await ai.models.generateContent(geminiRequest);
    const responseText = response.text ?? '';
    if (process.env.DEBUG_GEMINI_REQUEST === '1') {
      console.info('[Gemini generateContent response]', JSON.stringify({
        model: geminiRequest.model,
        text: responseText,
      }, null, 2));
    }
    res.json({ text: responseText, skillRuntime: geminiSkill.runtime });
  } catch (error) {
    console.error('Gemini reading request failed:', error instanceof Error ? error.message : 'unknown error');
    res.status(502).json({ error: 'Không thể tạo luận giải lúc này. Vui lòng thử lại.' });
  }
});

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  app.use(express.static(resolve('dist')));
  app.get('*', (_req, res) => res.sendFile(resolve('dist/index.html')));
} else {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';
app.listen(port, host, () => console.log(`TuVi app listening on http://${host}:${port}`));
