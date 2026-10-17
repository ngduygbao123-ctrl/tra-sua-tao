import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_INSTRUCTION = `
Bạn là "Trợ lý ảo Trà sữa Táo" 🍎, hỗ trợ thân thiện, ngắn gọn, 100% bằng tiếng Việt.
--- BẢNG GIÁ VÀ MENU CHÍNH THỨC:
- Trà sữa truyền thống: 25.000đ
- Trà sữa trân châu đường đen: 32.000đ
- Trà sữa matcha: 35.000đ
- Trà đào: 29.000đ
- Trà vải: 29.000đ
--- TÙY CHỌN: Đường (0%, 30%, 50%, 70%, 100%), Đá (Không đá, 50%, 100%).
--- KHUYẾN MÃI: Giảm 10% cho học sinh/sinh viên có thẻ tại quầy.
--- CHÍNH SÁCH: Phí ship tính theo khu vực. Khiếu nại liên hệ Hotline 0900.123.456. KHÔNG tự ý tạo đơn thật hoặc hoàn tiền.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chưa tìm thấy GEMINI_API_KEY trên Render.' });
    }

    const { message } = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `${SYSTEM_INSTRUCTION}\n\nKhách hỏi: "${message}"\nTrả lời:`;

    // Danh sách các model tương thích từ Google
    const candidateModels = [
      'gemini-1.5-flash-latest',
      'gemini-pro',
      'gemini-1.0-pro',
      'gemini-1.5-pro-latest'
    ];

    let reply = null;
    let lastError = null;

    // Thử từng model, cái nào chạy được thì lấy luôn
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        reply = result.response.text();
        if (reply) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (reply) {
      res.json({ reply });
    } else {
      throw lastError;
    }
  } catch (error) {
    console.error('Lỗi chi tiết:', error);
    res.status(500).json({ error: 'Lỗi Google API: ' + (error.message || 'Không thể tạo câu trả lời.') });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});
