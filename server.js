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
      return res.status(500).json({ error: 'Chưa tìm thấy GEMINI_API_KEY trên Render. Vui lòng thêm vào mục Environment!' });
    }

    const { message } = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Sử dụng model gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Gộp hướng dẫn hệ thống cùng câu hỏi
    const prompt = `${SYSTEM_INSTRUCTION}\n\nKhách hàng hỏi: "${message}"\nHãy trả lời khách hàng:`;
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error('Lỗi chi tiết:', error);
    res.status(500).json({ error: 'Lỗi Google API: ' + (error.message || 'Kiểm tra lại API Key!') });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});
