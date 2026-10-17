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

// BẢNG GIÁ 5 MÓN CHÍNH THỨC
const MENU = {
  'truyền thống': { name: 'Trà sữa truyền thống', price: 25000 },
  'đường đen': { name: 'Trà sữa trân châu đường đen', price: 32000 },
  'matcha': { name: 'Trà sữa matcha', price: 35000 },
  'đào': { name: 'Trà đào', price: 29000 },
  'vải': { name: 'Trà vải', price: 29000 }
};

// ====================================================================
// 1. BỘ XỬ LÝ TỪ CHỐI KHÉO LÉO & BẢO VỆ NGUYÊN TẮC (POLITE REFUSALS)
// ====================================================================
function checkPoliteRefusals(query) {
  const q = query.toLowerCase();

  // (1) Từ chối ngôn từ thô tục / xúc phạm
  if (q.includes('chửi') || q.includes('đụ') || q.includes('đm') || q.includes('vcl') || q.includes('mẹ mày') || q.includes('ngu')) {
    return "Dạ Trà Sữa Táo luôn tôn trọng và lắng nghe mọi góp ý của khách hàng. Tuy nhiên, mong bạn giữ ngôn từ lịch sự để tụi mình có thể hỗ trợ bạn tốt nhất nhé ạ!";
  }

  // (2) Từ chối xin nợ / uống thiếu
  if (q.includes('nợ') || q.includes('uống thiếu') || q.includes('cho thiếu') || q.includes('mai trả') || q.includes('uống chịu') || q.includes('quịt')) {
    return "Dạ quán rất quý bạn nhưng vì quy định đối soát doanh thu cuối ngày của thu ngân, quán **không thể hỗ trợ bán nợ hay cho thiếu tiền** được ạ! Bạn có thể chuyển khoản online qua VietQR hoặc MoMo chỉ mất 3 giây thôi nè!";
  }

  // (3) Từ chối ship ngoài giờ hoạt động (sau 22h30 đêm hoặc sáng sớm)
  if (q.includes('1h đêm') || q.includes('2h đêm') || q.includes('3h sáng') || q.includes('12h đêm') || q.includes('nửa đêm') || q.includes('khuya')) {
    return "Dạ quán **từ chối nhận đơn giao sau 22:30 đêm** ạ! Quán chỉ hoạt động từ **08:00 đến 22:30 mỗi ngày** để các bạn nhân viên nghỉ ngơi và chuẩn bị nguyên liệu tươi mới cho ngày hôm sau. Hẹn bạn vào sáng mai nha!";
  }

  // (4) Từ chối tự động hoàn tiền / hủy đơn qua chat
  if (q.includes('hoàn tiền ngay') || q.includes('trả lại tiền cho tôi') || q.includes('hủy đơn ngay') || q.includes('bấm hủy đơn')) {
    return "Dạ vì là Trợ lý AI mô phỏng, mình **không có quyền can thiệp vào tài khoản ngân hàng hoặc tự ý bấm hoàn tiền/hủy đơn**. Bạn vui lòng giữ lại hóa đơn và gọi ngay Hotline: **0900.123.456** để nhân viên trực tiếp xác minh và hoàn tiền cho bạn nhé!";
  }

  // (5) Từ chối mặc cả giá vô lý
  if (q.includes('10k') || q.includes('15k bán không') || q.includes('bớt nửa giá') || q.includes('giảm 50%') || q.includes('cho miễn phí')) {
    return "Dạ mức giá 25k - 35k tại quán là mức giá niêm yết chuẩn nhất để đảm bảo cốt trà sạch và sữa tươi tiệt trùng. Quán **không thể giảm giá thêm theo thỏa thuận riêng** được ạ. Nếu là học sinh/sinh viên, bạn nhớ mang thẻ để được giảm 10% theo quy định nhé!";
  }

  // (6) Từ chối tiết lộ công thức pha chế bí mật
  if (q.includes('công thức') || q.includes('bí quyết pha') || q.includes('dùng nguyên liệu gì') || q.includes('hãng nào')) {
    return "Dạ công thức pha chế và tỷ lệ ủ trà là **bí mật độc quyền của thương hiệu Trà Sữa Táo** nên quán không thể chia sẻ được ạ! Nhưng khi nào thèm, bạn cứ nhắn là tụi mình giao ngay ly trà thơm ngon chuẩn vị đến tận tay bạn nhé!";
  }

  // (7) Từ chối xin thông tin cá nhân / trêu ghẹo nhân viên
  if (q.includes('xin sđt') || q.includes('xin info') || q.includes('nhân viên nữ') || q.includes('làm quen') || q.includes('yêu bạn') || q.includes('có người yêu chưa')) {
    return "Dạ mình chỉ là Trợ lý AI chăm sóc khách hàng của Trà Sữa Táo thôi nè! Tụi mình **từ chối cung cấp thông tin cá nhân hoặc số điện thoại riêng của nhân viên quán**. Bạn cần hỗ trợ thêm thông tin gì về đồ uống không ạ?";
  }

  // (8) Từ chối ship quá xa / đi tỉnh khác
  if (q.includes('hà nội') || q.includes('đà nẵng') || q.includes('cần thơ') || q.includes('hải phòng') || q.includes('tỉnh khác') || q.includes('20km') || q.includes('30km')) {
    return "Dạ quán **từ chối nhận ship đi tỉnh hoặc khoảng cách trên 10km** ạ! Vì trà sữa và trân châu tươi chỉ giữ được độ ngon nhất trong vòng 2 tiếng, đi quá xa sẽ làm đá tan và mất chất lượng đồ uống. Rất mong bạn thông cảm giúp quán nha!";
  }

  // (9) Từ chối các món ngoài danh mục menu 5 món
  const outOfMenu = ['cà phê', 'cafe', 'sinh tố', 'nước cam', 'trà xoài', 'trà chanh', 'bánh tráng', 'bánh ngọt', 'hạt hướng dương', 'bia', 'thuốc lá'];
  for (const item of outOfMenu) {
    if (q.includes(item)) {
      return `Dạ hiện tại Trà Sữa Táo **chưa phục vụ món "${item}"** ạ! Quán chỉ tập trung vào 5 món cốt trà tinh túy: Trà sữa truyền thống, Trân châu đường đen, Matcha, Trà đào và Trà vải. Bạn thử đổi sang một ly Trà đào giòn ngọt nhé?`;
    }
  }

  return null; // Không có yêu cầu vi phạm, chuyển sang xử lý nghiệp vụ bình thường
}

// ====================================================================
// 2. BỘ TÍNH TOÁN HÓA ĐƠN TỰ ĐỘNG
// ====================================================================
function calculateBill(text) {
  const q = text.toLowerCase();
  let items = [];
  let subtotal = 0;

  for (const [key, item] of Object.entries(MENU)) {
    if (q.includes(key)) {
      const regex = new RegExp(`(\\d+)\\s*(ly|cốc)?\\s*(trà\\s*sữa\\s*)?${key}`, 'i');
      const match = q.match(regex);
      let qty = match ? parseInt(match[1]) : 1;
      items.push({ name: item.name, price: item.price, qty: qty, total: item.price * qty });
      subtotal += item.price * qty;
    }
  }

  if (items.length === 0) return null;

  const hasStudentCard = q.includes('sinh viên') || q.includes('thẻ sv') || q.includes('hssv');
  const discount = hasStudentCard ? Math.round(subtotal * 0.1) : 0;

  let shipFee = 15000;
  const totalQty = items.reduce((acc, cur) => acc + cur.qty, 0);

  if (q.includes('ktx') || q.includes('gần') || q.includes('1km') || totalQty >= 3 || subtotal >= 100000) {
    shipFee = 0;
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

// ====================================================================
// 3. ĐIỀU HƯỚNG TỔNG HỢP CỦA CHATBOT
// ====================================================================
function smartAssistant(userMessage) {
  const q = (userMessage || '').toLowerCase().trim();

  // BƯỚC 1: Kiểm tra xem có rơi vào các tình huống cần từ chối không
  const refusalResponse = checkPoliteRefusals(q);
  if (refusalResponse) return refusalResponse;

  // BƯỚC 2: Kiểm tra tính toán hóa đơn
  if (q.includes('tính tiền') || q.includes('tổng cộng') || q.includes('hết bao nhiêu') || q.includes('đặt') || q.includes('cho mình')) {
    const bill = calculateBill(q);
    if (bill) return bill;
  }

  // BƯỚC 3: Cảm xúc & Tâm trạng
  if (q.includes('buồn') || q.includes('thất tình') || q.includes('chán') || q.includes('stress')) {
    return "Ôm bạn một cái thật ấm áp nè! ❤️ Hãy thưởng cho mình một ly **Trà sữa trân châu đường đen (32.000đ)** nhé. Vị ngọt thơm caramel và trân châu dai mềm sẽ giúp xoa dịu cảm xúc rất tốt đấy!";
  }

  if (q.includes('buồn ngủ') || q.includes('deadline') || q.includes('tỉnh táo')) {
    return "📚 **Bí kíp chạy deadline:** Chọn ngay **Trà sữa Matcha (35.000đ)**! Tinh chất trà xanh nguyên chất giúp bạn tập trung tỉnh táo cả buổi tối mà không hề gây cồn cào!";
  }

  // BƯỚC 4: Nghiệp vụ phí ship
  if (q.includes('ship') || q.includes('giao hàng') || q.includes('phí ship')) {
    return "🛵 **Chính sách giao hàng của Trà Sữa Táo:**\n" +
           "• Bán kính < 1km (hoặc KTX): 10.000đ (Đơn từ 3 ly được **FREESHIP**).\n" +
           "• 1km - 3km: 15.000đ - 20.000đ.\n" +
           "• Đi xa quán luôn **đóng đá riêng trong túi zip** để không bị nhạt vị trà bạn nhé!";
  }

  // BƯỚC 5: Menu
  if (q.includes('menu') || q.includes('món') || q.includes('giá')) {
    return "🍎 **MENU CHUẨN GIÁ HÔM NAY:**\n\n" +
           "1. Trà sữa truyền thống: **25.000đ**\n" +
           "2. Trà đào: **29.000đ**\n" +
           "3. Trà vải: **29.000đ**\n" +
           "4. Trà sữa trân châu đường đen: **32.000đ**\n" +
           "5. Trà sữa matcha: **35.000đ**\n\n" +
           "🎁 Giảm 10% khi xuất trình thẻ HSSV tại quầy!";
  }

  // BƯỚC 6: Khuyến mãi
  if (q.includes('khuyến mãi') || q.includes('ưu đãi') || q.includes('giảm giá')) {
    return "🎁 Quán đang có chương trình: **Giảm ngay 10% trên tổng hóa đơn** dành riêng cho Học sinh - Sinh viên khi xuất trình thẻ tại quầy!";
  }

  // BƯỚC 7: Giờ mở cửa & Địa chỉ
  if (q.includes('giờ') || q.includes('địa chỉ') || q.includes('ở đâu')) {
    return "📍 **Địa chỉ:** Kios Trà Sữa Táo - Khu phố Sinh viên (Đối diện cổng trường).\n🕒 **Giờ mở cửa:** 08:00 - 22:30 hàng ngày!";
  }

  // BƯỚC 8: Mặc định
  return "Xin chào bạn! Mình là Trợ lý AI của **Trà Sữa Táo 🍎**.\n\n" +
         "Mình sẵn sàng hỗ trợ bạn tư vấn menu, tính tiền tự động, phí ship hoặc giải đáp chính sách của quán. Bạn cần mình giúp gì hôm nay?";
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const reply = smartAssistant(message);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server Trà Sữa Táo đang chạy tại cổng ${PORT}`);
});
