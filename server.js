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

// THÔNG TIN CHÍNH THỨC CỦA QUÁN
const STORE = {
  name: "Trà Sữa Táo 🍎",
  address: "224 Quốc Lộ 13, Phường 26, Quận Bình Thạnh, TP.HCM",
  hotline: "0900.123.456",
  bankName: "MB Bank (Ngân hàng Quân Đội)",
  stk: "2240139999",
  accountName: "TRA SUA TAO BINH THANH",
  momo: "0900123456"
};

// ====================================================================
// 1. BỘ LỌC TỪ CHỐI CÁC THỨ KHÔNG LIÊN QUAN ĐẾN TRÀ SỮA
// ====================================================================
function checkUnrelatedTopic(userText) {
  const q = userText.toLowerCase().trim();

  // (1) Hỏi bài tập, giải toán, viết văn, viết code
  if (q.includes('giải bài') || q.includes('bài tập') || q.includes('viết văn') || q.includes('giải toán') || 
      q.includes('vật lý') || q.includes('hóa học') || q.includes('lịch sử') || q.includes('tiếng anh') || 
      q.includes('viết code') || q.includes('python') || q.includes('javascript') || q.includes('lập trình') || q.includes('html')) {
    return "📚 Dạ mình là Trợ lý chăm sóc khách hàng của **Trà Sữa Táo (224 QL13)**, không phải gia sư hay trợ lý học tập nên không thể giải bài giúp bạn được ạ! 🍎\n\nNhưng nếu học bài mệt quá, để quán ship cho bạn 1 ly **Trà sữa Matcha (35k)** đậm vị giúp tỉnh táo chạy deadline điểm cao nhé!";
  }

  // (2) Món ăn ngoài menu (Cơm, phở, bún, pizza, bia, rượu, thuốc lá...)
  const unrelatedFoods = ['cơm', 'phở', 'bún', 'bánh mì', 'hủ tiếu', 'pizza', 'gà rán', 'mì cay', 'rượu', 'bia', 'thuốc lá', 'cà phê', 'cafe', 'sinh tố', 'nước cam'];
  for (const item of unrelatedFoods) {
    if (q.includes(item)) {
      return `🍜 Dạ quán chỉ chuyên phục vụ **Trà Sữa và Trà Trái Cây**, tuyệt đối không bán "${item}" hay các đồ ăn/thức uống ngoài ngành ạ!\n\nBạn tham khảo 5 món chính thức của quán tại 224 QL13: Trà sữa truyền thống, Trân châu đường đen, Matcha, Trà đào và Trà vải nhé!`;
    }
  }

  // (3) Thời tiết, tin tức, giá vàng, chứng khoán, tiền ảo
  if (q.includes('thời tiết') || q.includes('dự báo') || q.includes('giá vàng') || q.includes('chứng khoán') || 
      q.includes('bitcoin') || q.includes('crypto') || q.includes('chính trị') || q.includes('chiến tranh') || q.includes('tổng thống')) {
    return "🌐 Dạ thông tin này nằm ngoài phạm vi hoạt động của quán trà sữa rồi ạ! Mình chỉ nắm rõ giá trà sữa, phí ship và các ưu đãi tại **224 Quốc Lộ 13, Bình Thạnh** thôi nè. Bạn cần mình tư vấn món gì giải nhiệt hôm nay không?";
  }

  // (4) Y tế, hỏi thuốc, khám bệnh
  if (q.includes('khám bệnh') || q.includes('uống thuốc gì') || q.includes('đau đầu uống') || q.includes('bệnh viện') || q.includes('bác sĩ') || q.includes('đau bụng uống thuốc')) {
    return "🩺 Dạ mình chỉ là AI phục vụ trà sữa, hoàn toàn không có chuyên môn y khoa nên không thể tư vấn bệnh hay thuốc men được ạ. Nếu cơ thể không khỏe, bạn nên nghỉ ngơi và liên hệ bác sĩ hoặc nhà thuốc gần nhất nhé!";
  }

  // (5) Đòi kể chuyện cười, làm thơ, hỏi ChatGPT / OpenAI
  if (q.includes('kể chuyện cười') || q.includes('hát') || q.includes('làm thơ') || q.includes('chatgpt') || q.includes('openai') || q.includes('ai tạo ra bạn')) {
    return "🍎 Dạ mình là Trợ lý ảo được thiết kế riêng cho **Trà Sữa Táo** thôi nè! Mình không biết làm thơ hay kể chuyện cười, nhưng pha trà sữa ngon và tính tiền tự động thì mình làm siêu nhanh! Bạn muốn thử một ly Trà đào mát lạnh không?";
  }

  // (6) Từ chối nợ tiền / Uống thiếu
  if (q.includes('nợ') || q.includes('uống thiếu') || q.includes('cho thiếu') || q.includes('mai trả') || q.includes('uống chịu')) {
    return "Dạ quán rất quý bạn nhưng vì quy định đối soát doanh thu cuối ngày, quán **không thể hỗ trợ bán nợ hay cho thiếu tiền** được ạ! Bạn có thể chuyển khoản online qua VietQR hoặc MoMo chỉ mất 3 giây thôi nè!";
  }

  // (7) Từ chối ship đêm khuya (sau 22h30)
  if (q.includes('1h đêm') || q.includes('2h đêm') || q.includes('3h sáng') || q.includes('nửa đêm') || q.includes('khuya')) {
    return "Dạ quán **từ chối nhận đơn giao sau 22:30 đêm** ạ! Quán chỉ hoạt động từ 08:00 đến 22:30 mỗi ngày để đảm bảo nguyên liệu ngày mới luôn tươi ngon. Hẹn bạn sáng mai nha!";
  }

  // (8) Từ chối tự động hoàn tiền qua chat
  if (q.includes('hoàn tiền ngay') || q.includes('trả lại tiền cho tôi') || q.includes('hủy đơn ngay')) {
    return "Dạ vì là AI mô phỏng, mình **không có quyền can thiệp vào tài khoản ngân hàng để bấm hoàn tiền/hủy đơn**. Bạn vui lòng giữ lại hóa đơn và gọi ngay Hotline: **0900.123.456** để nhân viên hỗ trợ ngay lập tức!";
  }

  return null; // Không vi phạm, chuyển sang xử lý nghiệp vụ
}

// ====================================================================
// 2. HỆ THỐNG TÍNH TIỀN CHUYÊN NGHIỆP
// ====================================================================
function parseAndCalculateOrder(userText) {
  let text = userText.toLowerCase();

  const wordToNum = { 'một': 1, 'mot': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'năm': 5, 'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10 };
  for (const [w, n] of Object.entries(wordToNum)) {
    text = text.replace(new RegExp(`\\b${w}\\b`, 'g'), n);
  }

  const menuDefs = [
    { key: 'duong_den', name: 'Trà sữa trân châu đường đen', price: 32000, keywords: ['đường đen', 'duong den', 'tcdd', 'trân châu đường đen'] },
    { key: 'matcha', name: 'Trà sữa matcha', price: 35000, keywords: ['matcha', 'mát cha', 'trà xanh'] },
    { key: 'truyen_thong', name: 'Trà sữa truyền thống', price: 25000, keywords: ['truyền thống', 'truyen thong', 'truyenthong'] },
    { key: 'dao', name: 'Trà đào', price: 29000, keywords: ['đào', 'dao', 'tra dao'] },
    { key: 'vai', name: 'Trà vải', price: 29000, keywords: ['vải', 'vai', 'tra vai'] }
  ];

  let orderItems = [];
  let subtotal = 0;

  menuDefs.forEach(item => {
    for (const kw of item.keywords) {
      if (text.includes(kw)) {
        const regexBefore = new RegExp(`(\\d+)\\s*(?:ly|cốc|suất|phần)?\\s*(?:trà sữa|trà)?\\s*${kw}`, 'i');
        const regexAfter = new RegExp(`${kw}\\s*(\\d+)\\s*(?:ly|cốc)?`, 'i');
        let match = text.match(regexBefore) || text.match(regexAfter);
        let qty = match ? parseInt(match[1]) : 1;

        if (!orderItems.some(x => x.key === item.key)) {
          orderItems.push({ key: item.key, name: item.name, price: item.price, qty: qty, total: item.price * qty });
          subtotal += item.price * qty;
        }
        break;
      }
    }
  });

  if (orderItems.length === 0) return null;

  let extraTopping = 0;
  if (text.includes('thêm trân châu') || text.includes('thêm thạch')) extraTopping = 5000;

  let customNote = [];
  if (text.includes('0% đường') || text.includes('không đường')) customNote.push('0% đường');
  else if (text.includes('30%') || text.includes('ít ngọt') || text.includes('30 đường')) customNote.push('30% đường');
  else if (text.includes('50%') || text.includes('ngọt vừa') || text.includes('50 đường')) customNote.push('50% đường');

  if (text.includes('không đá')) customNote.push('Không đá');
  else if (text.includes('ít đá') || text.includes('50% đá')) customNote.push('50% đá');
  else if (text.includes('đá riêng')) customNote.push('Đá riêng');

  const isStudent = text.includes('sinh viên') || text.includes('thẻ sv') || text.includes('hssv');
  const discount = isStudent ? Math.round(subtotal * 0.1) : 0;

  let shipFee = 15000;
  let shipLocation = "Nội thành Bình Thạnh";

  if (text.includes('bến xe miền đông') || text.includes('bxmd') || text.includes('nguyễn xí') || text.includes('chu văn an') || text.includes('1km') || text.includes('gần')) {
    shipFee = 10000;
    shipLocation = "Bán kính < 1km (Gần quán 224 QL13)";
  } else if (text.includes('hutech') || text.includes('ngoại thương') || text.includes('ftu') || text.includes('gtvt') || text.includes('ung văn khiêm') || text.includes('d2')) {
    shipFee = 15000;
    shipLocation = "Khu vực ĐH Bình Thạnh (1 - 3km)";
  } else if (text.includes('gò vấp') || text.includes('phú nhuận') || text.includes('thủ đức') || text.includes('quận 1') || text.includes('q1')) {
    shipFee = 20000;
    shipLocation = "Quận lân cận (3 - 5km)";
  }

  const totalCups = orderItems.reduce((sum, item) => sum + item.qty, 0);
  let isFreeShip = false;
  if (totalCups >= 3 || subtotal >= 100000 || (shipFee === 10000 && totalCups >= 2)) {
    shipFee = 0;
    isFreeShip = true;
  }

  const finalTotal = subtotal + extraTopping - discount + shipFee;
  const orderId = '#TS' + Math.floor(1000 + Math.random() * 9000);

  let receipt = `🧾 **HÓA ĐƠN TÍNH TIỀN TỰ ĐỘNG - ${STORE.name}**\n`;
  receipt += `📍 *Xuất phát: ${STORE.address}*\n`;
  receipt += `🔖 *Mã đơn: ${orderId}* | *Hotline: ${STORE.hotline}*\n`;
  receipt += `--------------------------------------------------\n`;
  orderItems.forEach((it, idx) => {
    receipt += `${idx + 1}. **${it.name}** x ${it.qty}: **${it.total.toLocaleString('vi-VN')}đ**\n`;
  });

  if (extraTopping > 0) receipt += `+ Thêm Topping trân châu: **+5.000đ**\n`;
  if (customNote.length > 0) receipt += `📝 *Ghi chú:* ${customNote.join(', ')}\n`;

  receipt += `--------------------------------------------------\n`;
  receipt += `• Tiền nước (${totalCups} ly): **${subtotal.toLocaleString('vi-VN')}đ**\n`;
  if (isStudent) receipt += `• Giảm giá HSSV (-10%): **-${discount.toLocaleString('vi-VN')}đ**\n`;
  receipt += `• Phí ship (${shipLocation}): **${isFreeShip ? 'FREESHIP (0đ) 🎉' : shipFee.toLocaleString('vi-VN') + 'đ'}**\n`;
  receipt += `👉 **TỔNG CỘNG THANH TOÁN: ${finalTotal.toLocaleString('vi-VN')}đ**\n\n`;

  receipt += `📱 **QUÉT MÃ QR ĐỂ THANH TOÁN:**\n`;
  receipt += `
<div style="background: linear-gradient(135deg, #D32F2F, #9A0007); color: white; padding: 14px; border-radius: 14px; margin: 12px 0; text-align: center; box-shadow: 0 4px 15px rgba(211,47,47,0.3);">
  <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 8px;">QUÉT MÃ VIETQR THANH TOÁN</div>
  <div style="background: white; padding: 8px; border-radius: 10px; display: inline-block;">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=2240139999" 
         alt="Mã QR Chuyển Khoản" 
         style="width: 190px; height: 190px; display: block;" />
  </div>
  <div style="font-size: 0.78rem; margin-top: 8px; color: #FFCDD2;">
    MB BANK • STK: <strong>2240139999</strong><br>
    Chủ TK: <strong>TRA SUA TAO BINH THANH</strong>
  </div>
</div>
`;
  receipt += `• Hoặc chọn trả **Tiền mặt (COD)** khi nhận hàng.\n`;
  receipt += `👉 Bạn nhắn **Địa chỉ nhận hàng + Số điện thoại** để quán giao ngay nhé!`;

  return receipt;
}

// ====================================================================
// 3. ĐIỀU HƯỚNG TỔNG HỢP CỦA CHATBOT
// ====================================================================
function smartAssistant(userMessage) {
  const q = (userMessage || '').toLowerCase().trim();

  // BƯỚC 1: TỪ CHỐI CÁC THỨ KHÔNG LIÊN QUAN
  const unrelatedRefusal = checkUnrelatedTopic(userMessage);
  if (unrelatedRefusal) {
    return unrelatedRefusal;
  }

  // BƯỚC 2: TÍNH TIỀN HÓA ĐƠN
  const calculatedBill = parseAndCalculateOrder(userMessage);
  if (calculatedBill) {
    return calculatedBill;
  }

  // BƯỚC 3: HỎI RIÊNG VỀ THANH TOÁN
  if (q.includes('thanh toán') || q.includes('chuyển khoản') || q.includes('stk') || q.includes('qr') || q.includes('momo') || q.includes('trả tiền')) {
    return `💳 **THÔNG TIN THANH TOÁN - TRÀ SỮA TÁO:**\n\n` +
           `Quán hỗ trợ quét mã VietQR hoặc chuyển khoản trực tiếp:\n` +
           `
<div style="background: linear-gradient(135deg, #D32F2F, #9A0007); color: white; padding: 14px; border-radius: 14px; margin: 12px 0; text-align: center;">
  <div style="background: white; padding: 8px; border-radius: 10px; display: inline-block;">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=2240139999" style="width: 190px; height: 190px; display: block;" />
  </div>
  <div style="font-size: 0.78rem; margin-top: 8px; color: #FFCDD2;">
    MB BANK • STK: <strong>2240139999</strong><br>
    Chủ TK: <strong>TRA SUA TAO BINH THANH</strong>
  </div>
</div>` +
           `• **Ví MoMo:** **${STORE.momo}**\n` +
           `• Hoặc trả **Tiền mặt (COD)** cho shipper khi nhận nước.\n\n` +
           `Bạn muốn đặt những món nào để quán làm ngay nè?`;
  }

  // BƯỚC 4: PHÍ SHIP
  if (q.includes('ship') || q.includes('giao hàng') || q.includes('phí') || q.includes('bình thạnh')) {
    return `🛵 **CHÍNH SÁCH SHIP HÀNG TỪ 224 QL13, BÌNH THẠNH:**\n\n` +
           `• **Bán kính < 1km (Gần Bến xe Miền Đông cũ):** 10.000đ (Đơn từ 2 ly được **FREESHIP**).\n` +
           `• **Khu vực ĐH Bình Thạnh (HUTECH, Ngoại Thương, GTVT):** 15.000đ (Đơn từ 3 ly được **FREESHIP**).\n` +
           `• **Quận lân cận (Gò Vấp, Phú Nhuận, Q.1):** 20.000đ - 25.000đ.\n` +
           `❄️ Quán luôn **đóng đá riêng túi zip** để không bị nhạt trà bạn nhé!`;
  }

  // BƯỚC 5: MENU
  if (q.includes('menu') || q.includes('món') || q.includes('giá') || q.includes('có gì')) {
    return "🍎 **MENU TRÀ SỮA TÁO (224 QL13, BÌNH THẠNH):**\n\n" +
           "1. Trà sữa truyền thống: **25.000đ**\n" +
           "2. Trà đào thanh mát: **29.000đ**\n" +
           "3. Trà vải thơm ngọt: **29.000đ**\n" +
           "4. Trà sữa trân châu đường đen: **32.000đ** (Best-seller)\n" +
           "5. Trà sữa matcha Nhật Bản: **35.000đ**\n\n" +
           "🎁 Giảm 10% cho HSSV có thẻ! Bạn muốn đặt món nào để mình tính tiền?";
  }

  // BƯỚC 6: KHUYẾN MÃI
  if (q.includes('khuyến mãi') || q.includes('ưu đãi') || q.includes('giảm giá')) {
    return "🎁 Quán đang có chương trình: **Giảm ngay 10% trên tổng hóa đơn** dành cho Học sinh - Sinh viên khi xuất trình thẻ tại quầy hoặc khi đặt hàng!";
  }

  // BƯỚC 7: ĐỊA CHỈ & GIỜ MỞ CỬA
  if (q.includes('địa chỉ') || q.includes('ở đâu') || q.includes('giờ') || q.includes('mở cửa')) {
    return `📍 **Địa chỉ:** ${STORE.address} (Gần Bến xe Miền Đông cũ).\n🕒 **Giờ mở cửa:** 08:00 - 22:30 mỗi ngày!`;
  }

  // MẶC ĐỊNH
  return `Xin chào bạn! Mình là Trợ lý AI của **Trà Sữa Táo 🍎** (224 QL13, P.26, Bình Thạnh).\n\n` +
         `Mình chỉ chuyên hỗ trợ các thông tin về **Trà Sữa & Đặt hàng** của quán thôi nha!\n` +
         `Bạn cần xem menu, tính tiền đặt món hay hỏi phí ship nào?`;
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const reply = smartAssistant(message);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server Trà Sữa Táo đang chạy tại cổng ${PORT}`);
});
