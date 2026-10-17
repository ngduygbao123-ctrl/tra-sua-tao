import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
      return res.status(500).json({ error: 'Chưa có GEMINI_API_KEY trên Render.' });
    }

    const { message } = req.body;

    // 1. Tự động hỏi Google danh sách model mà Key của bạn được phép dùng
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();

    if (listData.error) {
      return res.status(500).json({ error: 'Lỗi API Key: ' + listData.error.message });
    }

    // 2. Tìm model phù hợp nhất đang mở cho bạn
    const availableModels = listData.models || [];
    const chosenModel = availableModels.find(m => 
      m.supportedGenerationMethods && 
      m.supportedGenerationMethods.includes('generateContent') &&
      !m.name.includes('embedding')
    );

    if (!chosenModel) {
      return res.status(500).json({ error: 'Không tìm thấy model phù hợp trong tài khoản Google này.' });
    }

    // 3. Gửi câu hỏi đến đúng model đó
    const prompt = `${SYSTEM_INSTRUCTION}\n\nKhách hỏi: "${message}"\nTrả lời:`;
    const genRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${chosenModel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const genData = await genRes.json();

    if (genData.error) {
      return res.status(500).json({ error: genData.error.message });
    }

    const reply = genData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      return res.status(500).json({ error: 'Google không trả về nội dung trả lời.' });
    }

    res.json({ reply });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({ error: 'Lỗi máy chủ: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
});
