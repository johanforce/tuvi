import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json({ limit: '256kb' }));

app.post('/api/bac-de/reading', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Máy chủ chưa được cấu hình GEMINI_API_KEY.' });
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

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Hãy luận giải thẻ Bắc Đế đền Hệ số ${number} dựa riêng trên dữ liệu thẻ bên dưới. Nêu ý chính của bài thơ, liên hệ tích quẻ và các phương diện có dữ liệu. Giải thích lời khuyên bằng tiếng Việt hiện đại, rõ ràng, có phần thuận lợi, điều nên thận trọng và gợi ý ứng xử thực tế. Phân biệt nội dung nguyên bản với phần diễn giải của bạn; không khẳng định tương lai chắc chắn, không tự thêm dữ liệu không có trong thẻ. Với phần đoán bệnh, chỉ tóm lược nội dung văn bản cổ và khuyên tìm chuyên gia y tế, không chẩn đoán hoặc thay tư vấn điều trị. Trình bày bằng Markdown ngắn gọn, dễ đọc.\n\nDỮ LIỆU THẺ:\n${JSON.stringify({ id: card.id, rating: card.rating, title: card.title, tich: card.tich, thi: card.thi, sections: card.sections })}`,
      config: { temperature: 0.3 },
    });
    res.json({ text: response.text ?? '' });
  } catch (error) {
    console.error('Bắc Đế reading request failed:', error instanceof Error ? error.message : 'unknown error');
    res.status(502).json({ error: 'Không thể tạo luận giải lúc này. Vui lòng thử lại.' });
  }
});

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
    const sectionInstruction = section === 'great_fortune' || Object.hasOwn(topicPromptFiles, section) ? '' : sectionInstructions[section];
    const outputInstruction = section === 'great_fortune'
      ? 'Bắt buộc trả lời đúng cấu trúc tiêu đề Markdown và các gạch đầu dòng ngắn trong mục 6. Không trả lời bằng các đoạn văn xuôi dài.'
      : '';
    const ai = new GoogleGenAI({ apiKey });
    const geminiRequest = {
      model: 'gemini-3.5-flash',
      contents: `DỮ LIỆU CUNG VÀ AN SAO (đã loại thông tin cá nhân):\n${JSON.stringify(chartData)}`,
      config: {
        systemInstruction: `${prompt}\n\n${sectionInstruction}\n\n${outputInstruction}`,
        temperature: 0.2,
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
    res.json({ text: responseText });
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
