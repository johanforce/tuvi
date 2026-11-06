import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json({ limit: '256kb' }));

app.post('/api/tuvi/reading', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Máy chủ chưa được cấu hình GEMINI_API_KEY.' });
    return;
  }

  const input = req.body;
  if (!input || typeof input !== 'object' || !input.chart || !Array.isArray(input.chart.palaces)) {
    res.status(400).json({ error: 'Dữ liệu cung và sao không hợp lệ.' });
    return;
  }

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
    greatFortuneCurrent: chart.greatFortuneCurrent,
    tuanBranches: chart.tuanBranches,
    trietBranches: chart.trietBranches,
    annualPendingStars: chart.annualPendingStars,
    engineWarnings: chart.engineWarnings,
    knownLimits: [
      'Chưa có bảng độ sáng sao đầy đủ đã xác minh.',
      'Trạng thái an sao có thể là ứng viên/chưa kiểm chứng; phải đọc status và note từng sao.',
      'Payload chỉ có đại hạn hiện tại; không có bảng đại hạn trọn đời đã kiểm chứng.',
    ],
    palaces: chart.palaces.map((palace: Record<string, any>) => ({
      name: palace.name,
      branch: palace.branch,
      canChi: palace.canChi,
      isMenh: palace.isMenh,
      isThan: palace.isThan,
      hasTuan: palace.hasTuan,
      hasTriet: palace.hasTriet,
      stars: Array.isArray(palace.stars) ? palace.stars.map((star: Record<string, any>) => ({
        id: star.id,
        name: star.name,
        scope: star.scope,
        status: star.status,
        note: star.note,
        brightness: star.brightness,
        brightnessStatus: star.brightnessStatus,
      })) : [],
    })),
  };

  try {
    const prompt = await readFile(resolve('src/promt_tongquat.md'), 'utf8');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `${prompt}\n\nDỮ LIỆU CUNG VÀ AN SAO (đã loại thông tin cá nhân):\n${JSON.stringify(chartData)}`,
      config: { temperature: 0.35 },
    });
    res.json({ text: response.text ?? '' });
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
const host = process.env.HOST ?? (isProduction ? '0.0.0.0' : '127.0.0.1');
app.listen(port, host, () => console.log(`TuVi app listening on http://${host}:${port}`));
