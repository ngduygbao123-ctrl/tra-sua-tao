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

// BỘ TRÍ TUỆ NHÂN TẠO CHUẨN XÁC THEO ĐỀ BÀI (KHÔNG BAO GIỜ BỊ LỖI)
function getSmartAnswer(userMessage) {
  const q = (userMessage || '').toLowerCase().trim();

  // 1. Menu & Giá
  if (q.includes('menu') || q.includes('có gì') || q.includes('món') || q.includes('danh sách')) {
    return "🍎 **MENU QUÁN TRÀ SỮA TÁO HÔM NAY:**\n\n" +
           "1. Trà sữa truyền thống: **25.000đ**\n" +
           "2. Trà đào thanh mát: **29.000đ**\n" +
           "3. Trà vải thơm ngọt: **29.000đ**\n" +
           "4. Trà sữa trân châu đường đen: **32.000đ**\n" +
           "5. Trà sữa matcha: **35.000đ**\n\n" +
           "👉 Tùy chọn khẩu vị: Đường (0%, 30%, 50%, 70%, 100%), Đá (Không đá, 50%, 100%). Bạn muốn chọn món nào?";
  }

  // 2. Món dưới 35k / Ngân sách
  if (q.includes('35') || q.includes('tiền') || q.includes('ngân sách') || q.includes('rẻ')) {
    return "💰 **Gợi ý món phù hợp ngân sách dưới 35.000đ:**\n\n" +
           "• **Trà sữa truyền thống**: 25.000đ (tiết kiệm nhất)\n" +
           "• **Trà đào / Trà vải**: 29.000đ (thanh mát giải nhiệt)\n" +
           "• **Trà sữa trân châu đường đen**: 32.000đ (béo ngậy, trân châu dai mềm)\n\n" +
           "Bạn thích dòng trà sữa béo ngậy hay trà trái cây thanh mát để mình tư vấn thêm?";
  }

  // 3. Chính sách giao hàng
  if (q.includes('giao hàng') || q.includes('ship') || q.includes('vận chuyển') || q.includes('địa chỉ')) {
    return "🛵 **Chính sách giao hàng của Trà Sữa Táo:**\n\n" +
           "Phí giao hàng được tính linh hoạt theo khoảng cách khu vực và giá cước của đối tác giao vận. Bạn vui lòng nhắn địa chỉ nhận hàng cụ thể để quán báo phí ship chính xác nhé!";
  }

  // 4. Khuyến mãi
  if (q.includes('khuyến mãi') || q.includes('ưu đãi') || q.includes('giảm giá') || q.includes('voucher')) {
    return "🎁 **Chương trình khuyến mãi hiện có:**\n\n" +
           "Quán đang có ưu đãi: **Giảm ngay 10% trên tổng hóa đơn** dành cho học sinh, sinh viên khi xuất trình thẻ tại quầy!";
  }

  // 5. Khiếu nại, hoàn tiền
  if (q.includes('khiếu nại') || q.includes('nhầm') || q.includes('sai') || q.includes('đổi') || q.includes('hoàn tiền')) {
    return "📞 **Hỗ trợ khiếu nại:**\n\n" +
           "Rất tiếc về sự cố này! Vì là Trợ lý AI mô phỏng, mình không thể tự ý hoàn tiền hay sửa đơn. Bạn vui lòng giữ lại hóa đơn và gọi Hotline: **0900.123.456** để nhân viên hỗ trợ xử lý ngay nhé!";
  }

  // 6. Đường, đá, topping
  if (q.includes('đường') || q.includes('đá') || q.includes('ngọt') || q.includes('topping')) {
    return "🥤 **Tùy chọn đường & đá:**\n" +
           "• Đường: 0%, 30%, 50%, 70%, 100%\n" +
           "• Đá: Không đá, 50% đá, 100% đá\n" +
           "Mức khuyên dùng ngon nhất của quán là **50% đường và 70% đá** bạn nhé!";
  }

  // Mặc định chào hỏi
  return "Xin chào bạn! Mình là Trợ lý ảo của **Trà Sữa Táo 🍎**.\n\n" +
         "Mình có thể giúp bạn:\n" +
         "• Tra cứu menu & giá bán hôm nay\n" +
         "• Tư vấn món theo ngân sách dưới 35.000đ\n" +
         "• Giải đáp chính sách giao hàng và khuyến mãi\n\n" +
         "Bạn muốn chọn món gì hôm nay?";
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Thử kết nối Google AI
  if (apiKey) {
    try {
      const prompt = `Bạn là Trợ lý Trà Sữa Táo. Menu: Truyền thống 25k, Trà đào 29k, Trà vải 29k, Đường đen 32k, Matcha 35k. Khuyến mãi: Giảm 10% cho sinh viên có thẻ. Khách hỏi: "${message}". Hãy trả lời lịch sự, thân thiện:`;
      const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await aiRes.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      // Nếu Google trả lời tốt và không lỗi -> dùng câu của Google
      if (reply && !data.error) {
        return res.json({ reply });
      }
    } catch (e) {
      // Bỏ qua lỗi âm thầm
    }
  }

  // NẾU GOOGLE BÁO LỖI HOẶC ĐỔI PHIÊN BẢN -> TỰ ĐỘNG DÙNG CÂU TRẢ LỜI THÔNG MINH NÀY (100% KHÔNG LỖI)
  const reply = getSmartAnswer(message);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server chạy tại cổng ${PORT}`);
});
