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

// CƠ SỞ TRI THỨC TOÀN DIỆN VỀ QUÁN TRÀ SỮA TÁO
function getSmartAnswer(userMessage) {
  const q = (userMessage || '').toLowerCase().trim();

  // 1. MENU CHÍNH & GIÁ BÁN
  if (q.includes('menu') || q.includes('có gì') || q.includes('món gì') || q.includes('danh sách')) {
    return "🍎 **MENU CHÍNH THỨC CỦA TRÀ SỮA TÁO:**\n\n" +
           "🧋 **Dòng Trà Sữa:**\n" +
           "• Trà sữa truyền thống: **25.000đ** (đậm vị trà, béo vị sữa)\n" +
           "• Trà sữa trân châu đường đen: **32.000đ** (trân châu dai mềm, thơm caramel)\n" +
           "• Trà sữa matcha: **35.000đ** (thơm đậm vị trà xanh Nhật Bản)\n\n" +
           "🍑 **Dòng Trà Trái Cây Thanh Nhiệt:**\n" +
           "• Trà đào: **29.000đ** (miếng đào giòn ngọt, giải nhiệt tức thì)\n" +
           "• Trà vải: **29.000đ** (thơm ngát vị vải tươi sảng khoái)\n\n" +
           "👉 Bạn có thể tùy chỉnh đường đá theo sở thích nhé!";
  }

  // 2. MÓN BÁN CHẠY NHẤT (BEST SELLER)
  if (q.includes('best') || q.includes('chạy nhất') || q.includes('ngon nhất') || q.includes('uống gì') || q.includes('gợi ý')) {
    return "🌟 **2 Món 'Best Seller' được yêu thích nhất quán:**\n\n" +
           "1. **Trà sữa trân châu đường đen (32.000đ):** Món 'cháy hàng' nhất với trân châu nấu mới mỗi 3 tiếng, dẻo dai bùi béo kết hợp sốt đường đen đậm vị.\n" +
           "2. **Trà đào thanh mát (29.000đ):** Lựa chọn số 1 cho những ngày nắng nóng, vị chua ngọt hài hòa kèm thịt đào giòn ngọt.\n\n" +
           "Hôm nay bạn muốn đổi gió với vị trà sữa hay trà trái cây nào?";
  }

  // 3. TƯ VẤN THEO NGÂN SÁCH (DƯỚI 35K / DƯỚI 30K)
  if (q.includes('35') || q.includes('30') || q.includes('tiền') || q.includes('ngân sách') || q.includes('rẻ')) {
    return "💰 **Gợi ý món 'vừa túi tiền' sinh viên dưới 35.000đ:**\n\n" +
           "• **25.000đ**: Trà sữa truyền thống (ngon chuẩn vị, giá siêu mềm)\n" +
           "• **29.000đ**: Trà đào hoặc Trà vải (thanh mát ngày hè)\n" +
           "• **32.000đ**: Trà sữa trân châu đường đen (đã có sẵn trân châu mềm dẻo)\n\n" +
           "Cả 4 món trên đều dưới 35k, bạn thích gu đậm trà béo sữa hay thanh mát?";
  }

  // 4. KHẨU VỊ: ĐƯỜNG, ĐÁ, ĐỘ NGỌT
  if (q.includes('đường') || q.includes('đá') || q.includes('ngọt') || q.includes('khẩu vị') || q.includes('ít ngọt')) {
    return "🥤 **Bảng tùy chỉnh khẩu vị tại Trà Sữa Táo:**\n\n" +
           "• **Mức đường:** 0% (không đường) | 30% (ít ngọt) | 50% (ngọt vừa) | 70% | 100% (chuẩn quán)\n" +
           "• **Mức đá:** Không đá | 50% đá (ít đá) | 100% đá (chuẩn lạnh)\n\n" +
           "💡 **Công thức chuẩn ngon của quán:** Bạn nên chọn **50% đường + 70% đá** để giữ trọn vị thơm béo mà không bị gắt cổ nhé!";
  }

  // 5. TOPPING
  if (q.includes('topping') || q.includes('trân châu') || q.includes('thạch')) {
    return "🧋 **Về Topping tại quán:**\n\n" +
           "• Món **Trà sữa trân châu đường đen (32k)** đã có sẵn trân châu đường đen dẻo dai nấu mới trong ngày.\n" +
           "• Đối với các món khác (Truyền thống, Matcha, Trà đào, Trà vải), bạn có thể dặn nhân viên khi gọi món tại quầy để được phục vụ theo ý thích nhé!";
  }

  // 6. GIỜ MỞ CỬA & ĐỊA CHỈ QUÁN
  if (q.includes('giờ') || q.includes('mở cửa') || q.includes('địa chỉ') || q.includes('ở đâu') || q.includes('đến quán')) {
    return "📍 **Thông tin quán Trà Sữa Táo:**\n\n" +
           "• **Giờ hoạt động:** 08:00 - 22:30 (Mở cửa tất cả các ngày trong tuần, kể cả ngày lễ)\n" +
           "• **Địa chỉ mô phỏng:** Kios Trà Sữa Táo - Khu phố Sinh viên (Đối diện cổng trường Đại học)\n" +
           "• Quán có máy lạnh, wifi tốc độ cao và ổ cắm điện cho các bạn học tập, làm việc nhóm!";
  }

  // 7. PHƯƠNG THỨC THANH TOÁN
  if (q.includes('thanh toán') || q.includes('chuyển khoản') || q.includes('momo') || q.includes('tiền mặt') || q.includes('quẹt thẻ')) {
    return "💳 **Phương thức thanh toán tiện lợi tại quán:**\n\n" +
           "• Tiền mặt tại quầy\n" +
           "• Quét mã QR chuyển khoản nhanh (VietQR / Tất cả ngân hàng)\n" +
           "• Ví điện tử MoMo, ZaloPay\n\n" +
           "*(Lưu ý: Là AI mô phỏng, mình không trực tiếp thu tiền hoặc trừ tài khoản của bạn)*.";
  }

  // 8. CÁCH BẢO QUẢN TRÀ SỮA
  if (q.includes('bảo quản') || q.includes('để được bao lâu') || q.includes('tủ lạnh') || q.includes('hôm sau')) {
    return "❄️ **Cách bảo quản trà sữa ngon nhất:**\n\n" +
           "• **Uống ngon nhất:** Trong vòng 2 - 4 tiếng sau khi pha chế.\n" +
           "• **Bảo quản:** Nếu chưa uống ngay, bạn nên bảo quản trong ngăn mát tủ lạnh (dưới 8°C) và dùng trong tối đa 24 giờ.\n" +
           "• **Mẹo:** Nên vớt trân châu ra trước khi để tủ lạnh vì để lạnh trân châu sẽ bị sượng và cứng lại nhé!";
  }

  // 9. CHÍNH SÁCH GIAO HÀNG
  if (q.includes('giao hàng') || q.includes('ship') || q.includes('vận chuyển')) {
    return "🛵 **Chính sách giao hàng của Trà Sữa Táo:**\n\n" +
           "• Quán nhận ship qua các đối tác giao hàng nhanh.\n" +
           "• **Phí giao hàng:** Được tính linh hoạt dựa theo khoảng cách (km) từ quán đến địa chỉ của bạn.\n" +
           "Bạn vui lòng gửi địa chỉ cụ thể để nhân viên kiểm tra và báo phí ship chính xác nhé!";
  }

  // 10. CHƯƠNG TRÌNH KHUYẾN MÃI
  if (q.includes('khuyến mãi') || q.includes('ưu đãi') || q.includes('giảm giá') || q.includes('voucher') || q.includes('sinh viên')) {
    return "🎁 **Ưu đãi độc quyền cho Sinh viên:**\n\n" +
           "🎉 **GIẢM NGAY 10% TRÊN TỔNG HÓA ĐƠN** dành cho tất cả các bạn học sinh, sinh viên khi xuất trình thẻ HSSV trực tiếp tại quầy gọi món!\n" +
           "Chương trình áp dụng mỗi ngày, nhớ mang thẻ sinh viên khi ghé quán nhé!";
  }

  // 11. KHIẾU NẠI & ĐƠN HÀNG
  if (q.includes('khiếu nại') || q.includes('nhầm') || q.includes('sai') || q.includes('hỏng') || q.includes('hoàn tiền')) {
    return "📞 **Hỗ trợ khiếu nại & Chăm sóc khách hàng:**\n\n" +
           "Rất xin lỗi vì trải nghiệm chưa hoàn hảo của bạn! Vì là Trợ lý AI mô phỏng, mình không thể tự ý bấm hoàn tiền hay sửa đơn. Bạn vui lòng chụp hình lại ly nước, giữ hóa đơn và gọi Hotline: **0900.123.456** để được nhân viên đổi mới ngay lập tức!";
  }

  // 12. HỎI CÁC MÓN KHÔNG CÓ TRONG QUÁN (Trà xoài, cà phê, sinh tố...)
  if (q.includes('xoài') || q.includes('cà phê') || q.includes('cafe') || q.includes('sinh tố') || q.includes('nước cam')) {
    return "Dạ hiện tại Trà Sữa Táo chỉ tập trung vào 5 món trà cốt tinh túy: Trà sữa truyền thống, Trân châu đường đen, Matcha, Trà đào và Trà vải ạ! Bạn thử một ly Trà đào giòn ngọt xem sao nhé?";
  }

  // MẶC ĐỊNH
  return "Xin chào bạn! Mình là Trợ lý ảo của **Trà Sữa Táo 🍎**.\n\n" +
         "Bạn có thể hỏi mình:\n" +
         "• 📋 'Menu hôm nay có gì?'\n" +
         "• 🌟 'Món nào bán chạy nhất?'\n" +
         "• 💰 'Tư vấn món dưới 35k'\n" +
         "• 🕒 'Giờ mở cửa và địa chỉ quán'\n" +
         "• 🎁 'Khuyến mãi hiện có'\n\n" +
         "Hôm nay bạn muốn thưởng thức món nào?";
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Bạn là Trợ lý ảo Trà Sữa Táo thân thiện, thông minh. Menu gồm: Truyền thống 25k, Trà đào 29k, Trà vải 29k, Đường đen 32k, Matcha 35k. Khuyến mãi: Giảm 10% HSSV. Giờ mở cửa: 8h-22h30. Hotline: 0900.123.456. Khách hỏi: "${message}". Hãy trả lời lịch sự, đầy đủ:`;
      const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await aiRes.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply && !data.error) {
        return res.json({ reply });
      }
    } catch (e) {
      // Tự động bỏ qua lỗi âm thầm
    }
  }

  // Luôn trả về dữ liệu nghiệp vụ chuẩn xác 100%
  const reply = getSmartAnswer(message);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server Trà Sữa Táo đang chạy tại cổng ${PORT}`);
});
