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

// MENU CHUẨN CỦA QUÁN
const MENU = {
  'truyền thống': { name: 'Trà sữa truyền thống', price: 25000 },
  'đường đen': { name: 'Trà sữa trân châu đường đen', price: 32000 },
  'matcha': { name: 'Trà sữa matcha', price: 35000 },
  'đào': { name: 'Trà đào', price: 29000 },
  'vải': { name: 'Trà vải', price: 29000 }
};

// 1. TÍNH TOÁN HÓA ĐƠN TỰ ĐỘNG THÔNG MINH
function calculateBill(text) {
  const q = text.toLowerCase();
  let items = [];
  let subtotal = 0;

  // Quét từng món và số lượng
  for (const [key, item] of Object.entries(MENU)) {
    if (q.includes(key)) {
      // Tìm số lượng đứng trước tên món (ví dụ: "2 trà đào", "3 truyền thống")
      const regex = new RegExp(`(\\d+)\\s*(ly|cốc)?\\s*(trà\\s*sữa\\s*)?${key}`, 'i');
      const match = q.match(regex);
      let qty = match ? parseInt(match[1]) : 1;
      
      items.push({ name: item.name, price: item.price, qty: qty, total: item.price * qty });
      subtotal += item.price * qty;
    }
  }

  if (items.length === 0) return null;

  // Tính giảm giá sinh viên (10%)
  const hasStudentCard = q.includes('sinh viên') || q.includes('thẻ sv') || q.includes('hssv') || q.includes('hoc sinh');
  const discount = hasStudentCard ? Math.round(subtotal * 0.1) : 0;

  // Tính phí ship
  let shipFee = 15000; // Mặc định
  const totalQty = items.reduce((acc, cur) => acc + cur.qty, 0);

  if (q.includes('ktx') || q.includes('gần') || q.includes('1km') || totalQty >= 3 || subtotal >= 100000) {
    shipFee = 0; // Đạt điều kiện Freeship
  } else if (q.includes('2km') || q.includes('3km')) {
    shipFee = 15000;
  } else if (q.includes('4km') || q.includes('5km')) {
    shipFee = 25000;
  }

  const finalTotal = subtotal - discount + shipFee;

  let bill = `🧾 **HÓA ĐƠN TÍNH TIỀN TỰ ĐỘNG:**\n\n`;
  items.forEach(it => {
    bill += `• ${it.name} x ${it.qty}: **${it.total.toLocaleString('vi-VN')}đ**\n`;
  });
  bill += `------------------------------\n`;
  bill += `• Tiền nước: **${subtotal.toLocaleString('vi-VN')}đ**\n`;
  if (hasStudentCard) {
    bill += `• Ưu đãi Sinh viên (-10%): **-${discount.toLocaleString('vi-VN')}đ**\n`;
  }
  bill += `• Phí giao hàng: **${shipFee === 0 ? 'FREESHIP (0đ) 🎉' : shipFee.toLocaleString('vi-VN') + 'đ'}**\n`;
  bill += `👉 **TỔNG CỘNG THANH TOÁN: ${finalTotal.toLocaleString('vi-VN')}đ**\n\n`;
  bill += `Bạn nhắn địa chỉ và số điện thoại để quán chốt đơn giao ngay nhé!`;

  return bill;
}

// 2. BỘ NÃO XỬ LÝ NGÔN NGỮ TỰ NHIÊN & CẢM XÚC
function smartAssistant(userMessage, history = []) {
  const q = (userMessage || '').toLowerCase().trim();

  // Kiểm tra xem khách có đang nhờ tính tiền / chốt đơn không
  if (q.includes('tính tiền') || q.includes('tổng cộng') || q.includes('hết bao nhiêu') || q.includes('đặt') || q.includes('lấy cho') || q.includes('cho mình')) {
    const billResult = calculateBill(q);
    if (billResult) return billResult;
  }

  // TÂM TRẠNG & CẢM XÚC
  if (q.includes('buồn') || q.includes('thất tình') || q.includes('chán') || q.includes('mệt') || q.includes('stress')) {
    return "Ôm bạn một cái thật ấm áp nè! ❤️ Những lúc mệt mỏi hay buồn phiền, lượng đường ngọt ngào và trân châu dai mềm của **Trà sữa trân châu đường đen (32.000đ)** sẽ giúp não tiết ra hormone hạnh phúc (Dopamine) cực kỳ hiệu quả đấy!\n\nĐể quán làm cho bạn một ly ngọt ngào lấy lại tinh thần nhé?";
  }

  if (q.includes('buồn ngủ') || q.includes('deadline') || q.includes('thức đêm') || q.includes('tỉnh táo') || q.includes('thi cử')) {
    return "📚 **Cứu tinh chạy deadline / mùa thi cử:**\n\nBạn hãy gọi ngay **Trà sữa Matcha (35.000đ)** nhé! Tinh chất trà xanh nguyên chất giàu EGCG và L-Theanine giúp bạn tập trung cao độ, tỉnh táo làm bài mà không hề gây cồn cào ruột như cà phê!";
  }

  if (q.includes('nóng') || q.includes('khát') || q.includes('mát') || q.includes('nhiệt')) {
    return "☀️ **Giải nhiệt cấp tốc ngày nắng nóng:**\n\nKhông gì tuyệt vời hơn một ly **Trà đào giòn ngọt (29k)** hoặc **Trà vải thanh mát (29k)** với 70% đá lạnh tê buốt sảng khoái. Uống một ngụm là bừng tỉnh cả người luôn bạn ơi!";
  }

  // GHI NHỚ ĐƯỜNG ĐÁ (Nếu câu trước vừa nói về món, câu sau dặn đường đá)
  if (q.includes('đường') || q.includes('đá') || q.includes('ngọt')) {
    return `🥤 Dạ quán đã ghi nhận khẩu vị: **${userMessage}**!\n` +
           `Quán sẽ pha đúng độ ngọt và đá theo ý bạn. Bạn có muốn thêm trân châu hay ghi chú gì thêm cho quán không?`;
  }

  // TẤT CẢ VỀ PHÍ SHIP
  if (q.includes('ship') || q.includes('giao hàng') || q.includes('freeship')) {
    return "🛵 **Chính sách giao hàng siêu tốc của Trà Sữa Táo:**\n\n" +
           "• **Freeship 100%:** Cho đơn từ 3 ly, hoặc đơn từ 100k, hoặc bán kính dưới 1km (khu KTX/trường học).\n" +
           "• **1km - 3km:** Phí chỉ 15.000đ.\n" +
           "• **Trên 3km:** Tính theo cước Grab/Ahamove ưu đãi.\n" +
           "❄️ Đi xa quán luôn **đóng đá riêng túi zip** để giữ trọn vị ngon không bị nhạt trà bạn nhé!";
  }

  // NGUỒN GỐC & AN TOÀN SỨC KHỎE
  if (q.includes('bẩn') || q.includes('hóa chất') || q.includes('sạch') || q.includes('nguồn gốc') || q.includes('an toàn')) {
    return "🛡️ **Cam kết Vệ sinh An toàn Thực phẩm 100%:**\n" +
           "• Lá trà Bảo Lộc (Lâm Đồng) ủ mới mỗi sáng, không dùng hương liệu nhân tạo.\n" +
           "• Sữa thanh trùng & trân châu bột năng tự nấu mới mỗi 3 tiếng.\n" +
           "• Quán nói KHÔNG với bột béo trôi nổi, tuyệt đối an toàn cho sức khỏe bạn nhé!";
  }

  // ĂN KIÊNG, CALO, TIỂU ĐƯỜNG
  if (q.includes('giảm cân') || q.includes('béo') || q.includes('mập') || q.includes('calo') || q.includes('ăn kiêng')) {
    return "🥗 **Gợi ý giữ dáng, không lo tăng cân:**\n" +
           "Bạn hãy chọn **Trà Đào** hoặc **Trà Vải 0% đường (hoặc 30% đường)** nhé! Lượng calo chỉ khoảng 60 - 80 kcal (bằng 1/5 trà sữa thông thường), cực kỳ thanh mát và hỗ trợ detox cơ thể!";
  }

  // MENU
  if (q.includes('menu') || q.includes('món') || q.includes('giá')) {
    return "🍎 **MENU CHUẨN GIÁ HÔM NAY:**\n\n" +
           "1. Trà sữa truyền thống: **25.000đ**\n" +
           "2. Trà đào: **29.000đ**\n" +
           "3. Trà vải: **29.000đ**\n" +
           "4. Trà sữa trân châu đường đen: **32.000đ** (Best-seller)\n" +
           "5. Trà sữa matcha: **35.000đ**\n\n" +
           "🎁 Giảm ngay 10% khi xuất trình thẻ HSSV tại quầy!";
  }

  // MÓN DƯỚI 35K
  if (q.includes('35') || q.includes('rẻ') || q.includes('tiền')) {
    return "💰 **Món ngon dưới 35k:**\n" +
           "• 25k: Trà sữa truyền thống\n" +
           "• 29k: Trà đào / Trà vải\n" +
           "• 32k: Trà sữa trân châu đường đen\n" +
           "Bạn thích dòng trà sữa béo ngậy hay trà trái cây thanh nhiệt?";
  }

  // KHUYẾN MÃI
  if (q.includes('khuyến mãi') || q.includes('ưu đãi') || q.includes('giảm giá')) {
    return "🎁 **Ưu đãi HSSV:** Giảm ngay **10% trên tổng bill** mỗi ngày khi bạn xuất trình thẻ học sinh, sinh viên tại quầy!";
  }

  // ĐỊA CHỈ & GIỜ MỞ CỬA
  if (q.includes('địa chỉ') || q.includes('giờ') || q.includes('ở đâu')) {
    return "📍 **Địa chỉ:** Kios Trà Sữa Táo - Khu phố Sinh viên (Đối diện cổng trường).\n🕒 **Giờ mở cửa:** 08:00 - 22:30 hàng ngày (kể cả Lễ, Tết)!";
  }

  // KHIẾU NẠI & HỖ TRỢ
  if (q.includes('khiếu nại') || q.includes('nhầm') || q.includes('đổi') || q.includes('hoàn tiền')) {
    return "📞 Rất xin lỗi bạn về sự cố! Vì là AI mô phỏng, mình chưa thể tự hoàn tiền trên app. Bạn vui lòng chụp hóa đơn và gọi Hotline: **0900.123.456** để nhân viên hỗ trợ đổi mới ngay lập tức nhé!";
  }

  // MẶC ĐỊNH
  return "Xin chào bạn! Mình là Trợ lý AI Siêu Thông Minh của **Trà Sữa Táo 🍎**.\n\n" +
         "Bạn có thể thử các tính năng cao cấp của mình:\n" +
         "• 🧮 **Tính tiền:** Gõ *'Tính tiền 2 ly trà đào, 1 đường đen có thẻ sinh viên ship 2km'*\n" +
         "• ❤️ **Tâm trạng:** Gõ *'Hôm nay mình buồn / đang chạy deadline buồn ngủ'*\n" +
         "• 🛵 **Giao hàng:** Gõ *'Ship KTX có freeship không?'*\n\n" +
         "Hôm nay bạn cần mình hỗ trợ gì nào?";
}

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  const reply = smartAssistant(message, history);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server chạy tại cổng ${PORT}`);
});
