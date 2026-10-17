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

// THÔNG TIN QUÁN
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
// HỆ THỐNG TÍNH TIỀN CHUYÊN NGHIỆP (ADVANCED BILLING ENGINE)
// ====================================================================

function parseAndCalculateOrder(userText) {
  let text = userText.toLowerCase();

  // 1. Chuyển đổi số dạng chữ sang số dạng số
  const wordToNum = { 'một': 1, 'mot': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'bon': 4, 'năm': 5, 'nam': 5, 'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10 };
  for (const [w, n] of Object.entries(wordToNum)) {
    text = text.replace(new RegExp(`\\b${w}\\b`, 'g'), n);
  }

  // Danh mục 5 món chuẩn đề bài
  const menuDefs = [
    { key: 'duong_den', name: 'Trà sữa trân châu đường đen', price: 32000, keywords: ['đường đen', 'duong den', 'tcdd', 'trân châu đường đen'] },
    { key: 'matcha', name: 'Trà sữa matcha', price: 35000, keywords: ['matcha', 'mát cha', 'trà xanh'] },
    { key: 'truyen_thong', name: 'Trà sữa truyền thống', price: 25000, keywords: ['truyền thống', 'truyen thong', 'truyenthong'] },
    { key: 'dao', name: 'Trà đào', price: 29000, keywords: ['đào', 'dao', 'tra dao'] },
    { key: 'vai', name: 'Trà vải', price: 29000, keywords: ['vải', 'vai', 'tra vai'] }
  ];

  let orderItems = [];
  let subtotal = 0;

  // Quét tìm từng món và số lượng
  menuDefs.forEach(item => {
    for (const kw of item.keywords) {
      if (text.includes(kw)) {
        // Tìm số lượng đứng trước (ví dụ: "2 ly trà đào", "3 đào")
        const regexBefore = new RegExp(`(\\d+)\\s*(?:ly|cốc|suất|phần)?\\s*(?:trà sữa|trà)?\\s*${kw}`, 'i');
        // Tìm số lượng đứng sau (ví dụ: "trà đào 2 ly")
        const regexAfter = new RegExp(`${kw}\\s*(\\d+)\\s*(?:ly|cốc)?`, 'i');

        let match = text.match(regexBefore) || text.match(regexAfter);
        let qty = match ? parseInt(match[1]) : 1;

        // Tránh cộng trùng nếu trùng từ khóa
        if (!orderItems.some(x => x.key === item.key)) {
          orderItems.push({
            key: item.key,
            name: item.name,
            price: item.price,
            qty: qty,
            total: item.price * qty
          });
          subtotal += item.price * qty;
        }
        break;
      }
    }
  });

  // Nếu không phát hiện món nào trong câu
  if (orderItems.length === 0) return null;

  // 2. Kiểm tra Topping thêm (+5.000đ/phần)
  let extraTopping = 0;
  if (text.includes('thêm trân châu') || text.includes('thêm thạch') || text.includes('extra topping')) {
    extraTopping = 5000;
  }

  // 3. Nhận diện ghi chú đường/đá
  let customNote = [];
  if (text.includes('0% đường') || text.includes('không đường')) customNote.push('0% đường');
  else if (text.includes('30%') || text.includes('ít ngọt') || text.includes('30 đường')) customNote.push('30% đường');
  else if (text.includes('50%') || text.includes('ngọt vừa') || text.includes('50 đường')) customNote.push('50% đường');
  else if (text.includes('70%')) customNote.push('70% đường');

  if (text.includes('không đá') || text.includes('0% đá')) customNote.push('Không đá');
  else if (text.includes('ít đá') || text.includes('50% đá') || text.includes('50 đá')) customNote.push('50% đá');
  else if (text.includes('đá riêng')) customNote.push('Đá riêng');

  // 4. Ưu đãi thẻ sinh viên (Giảm 10% tiền nước)
  const isStudent = text.includes('sinh viên') || text.includes('thẻ sv') || text.includes('hssv') || text.includes('hoc sinh');
  const discount = isStudent ? Math.round(subtotal * 0.1) : 0;

  // 5. Tính phí ship từ 224 QL13, P.26, Bình Thạnh
  let shipFee = 15000;
  let shipLocation = "Nội thành Bình Thạnh";

  if (text.includes('bến xe miền đông') || text.includes('bxmd') || text.includes('nguyễn xí') || text.includes('đinh bộ lĩnh') || text.includes('chu văn an') || text.includes('gần quán') || text.includes('1km')) {
    shipFee = 10000;
    shipLocation = "Bán kính < 1km (Gần 224 QL13)";
  } else if (text.includes('hutech') || text.includes('ngoại thương') || text.includes('ftu') || text.includes('gtvt') || text.includes('ung văn khiêm') || text.includes('võ oanh') || text.includes('d2') || text.includes('thanh đa')) {
    shipFee = 15000;
    shipLocation = "Khu vực ĐH Bình Thạnh (1 - 3km)";
  } else if (text.includes('gò vấp') || text.includes('phú nhuận') || text.includes('thủ đức') || text.includes('quận 1') || text.includes('q1')) {
    shipFee = 20000;
    shipLocation = "Quận lân cận (3 - 5km)";
  }

  // Quy tắc FREESHIP
  const totalCups = orderItems.reduce((sum, item) => sum + item.qty, 0);
  let isFreeShip = false;
  if (totalCups >= 3 || subtotal >= 100000 || (shipFee === 10000 && totalCups >= 2)) {
    shipFee = 0;
    isFreeShip = true;
  }

  const finalTotal = subtotal + extraTopping - discount + shipFee;
  const orderId = '#TS' + Math.floor(1000 + Math.random() * 9000);

  // 6. TẠO GIAO DIỆN HÓA ĐƠN ĐẶT HÀNG ĐẦY ĐỦ
  let receipt = `🧾 **HÓA ĐƠN TÍNH TIỀN TỰ ĐỘNG - ${STORE.name}**\n`;
  receipt += `📍 *Xuất phát: ${STORE.address}*\n`;
  receipt += `🔖 *Mã đơn hàng: ${orderId}* | *Hotline: ${STORE.hotline}*\n`;
  receipt += `--------------------------------------------------\n`;
  receipt += `**DANH SÁCH MÓN ĐẶT:**\n`;
  orderItems.forEach((it, idx) => {
    receipt += `${idx + 1}. **${it.name}** x ${it.qty}: **${it.total.toLocaleString('vi-VN')}đ**\n`;
  });

  if (extraTopping > 0) {
    receipt += `+ Thêm Topping trân châu: **+5.000đ**\n`;
  }
  if (customNote.length > 0) {
    receipt += `📝 *Ghi chú khẩu vị:* ${customNote.join(', ')}\n`;
  }

  receipt += `--------------------------------------------------\n`;
  receipt += `• Tổng tiền nước (${totalCups} ly): **${subtotal.toLocaleString('vi-VN')}đ**\n`;
  if (isStudent) {
    receipt += `• Ưu đãi Sinh viên (-10%): **-${discount.toLocaleString('vi-VN')}đ**\n`;
  }
  receipt += `• Phí giao hàng (${shipLocation}): **${isFreeShip ? 'FREESHIP (0đ) 🎉' : shipFee.toLocaleString('vi-VN') + 'đ'}**\n`;
  receipt += `👉 **TỔNG CỘNG THANH TOÁN: ${finalTotal.toLocaleString('vi-VN')}đ**\n\n`;

  // GẮN KHUNG MÃ QR VÀ THÔNG TIN THANH TOÁN
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
  receipt += `• Hoặc bạn có thể chọn trả **Tiền mặt (COD)** khi nhận hàng.\n`;
  receipt += `👉 Bạn nhắn cho quán **Địa chỉ nhận hàng + Số điện thoại** để quán pha chế giao ngay nhé!`;

  return receipt;
}

// ====================================================================
// ĐIỀU HƯỚNG TỔNG HỢP CỦA CHATBOT
// ====================================================================
function smartAssistant(userMessage) {
  const q = (userMessage || '').toLowerCase().trim();

  // 1. TỰ ĐỘNG BẮT TÍNH TIỀN HÓA ĐƠN ĐẦY ĐỦ
  const calculatedBill = parseAndCalculateOrder(userMessage);
  if (calculatedBill) {
    return calculatedBill;
  }

  // 2. HỎI RIÊNG VỀ THANH TOÁN TIỀN
  if (q.includes('thanh toán') || q.includes('chuyển khoản') || q.includes('stk') || q.includes('qr') || q.includes('momo') || q.includes('trả tiền')) {
    return `💳 **THÔNG TIN THANH TOÁN - TRÀ SỮA TÁO:**\n\n` +
           `Quán hỗ trợ quét mã VietQR hoặc chuyển khoản trực tiếp:\n` +
           `
<div style="background: linear-gradient(135deg, #D32F2F, #9A0007); color: white; padding: 14px; border-radius: 14px; margin: 12px 0; text-align: center;">
  <div style="background: white; padding: 8px; border-radius: 10px; display: inline-block;">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=2240139999" style="width: 190px; height: 190px; display: block;" />
  </div>
  <div style="font-size: 0.78rem; margin-top: 8px; color: #FFCDD2;">
    Ngân hàng: <strong>MB BANK</strong> • STK: <strong>2240139999</strong><br>
    Chủ TK: <strong>TRA SUA TAO BINH THANH</strong>
  </div>
</div>` +
           `• **Ví MoMo:** **${STORE.momo}**\n` +
           `• Hoặc trả **Tiền mặt (COD)** cho shipper khi nhận trà sữa.\n\n` +
           `Bạn muốn đặt những món nào để quán tính tiền và giao liền nè?`;
  }

  // 3. PHÍ SHIP TỪ 224 QL13 BÌNH THẠNH
  if (q.includes('ship') || q.includes('giao hàng') || q.includes('phí') || q.includes('bình thạnh')) {
    return `🛵 **CHÍNH SÁCH SHIP HÀNG TỪ 224 QL13, BÌNH THẠNH:**\n\n` +
           `• **Bán kính < 1km (Gần Bến xe Miền Đông cũ):** 10.000đ (Đơn từ 2 ly được **FREESHIP**).\n` +
           `• **Khu vực ĐH Bình Thạnh (HUTECH, Ngoại Thương, GTVT):** 15.000đ (Đơn từ 3 ly được **FREESHIP**).\n` +
           `• **Quận lân cận (Gò Vấp, Phú Nhuận, Q.1):** 20.000đ - 25.000đ.\n` +
           `❄️ Quán luôn **đóng đá riêng túi zip** để không bị nhạt trà bạn nhé!\n\n` +
           `Bạn nhắn tên món và địa chỉ để quán tính tiền tự động cho bạn nha!`;
  }

  // 4. MENU CHUẨN
  if (q.includes('menu') || q.includes('món') || q.includes('giá') || q.includes('có gì')) {
    return "🍎 **MENU TRÀ SỮA TÁO (224 QL13, BÌNH THẠNH):**\n\n" +
           "1. Trà sữa truyền thống: **25.000đ**\n" +
           "2. Trà đào thanh mát: **29.000đ**\n" +
           "3. Trà vải thơm ngọt: **29.000đ**\n" +
           "4. Trà sữa trân châu đường đen: **32.000đ** (Best-seller)\n" +
           "5. Trà sữa matcha Nhật Bản: **35.000đ**\n\n" +
           "🎁 Giảm 10% cho HSSV có thẻ! Bạn muốn đặt món nào để mình tính tiền?";
  }

  // 5. KHUYẾN MÃI
  if (q.includes('khuyến mãi') || q.includes('ưu đãi') || q.includes('giảm giá')) {
    return "🎁 Quán đang có chương trình: **Giảm ngay 10% trên tổng hóa đơn** dành cho Học sinh - Sinh viên khi xuất trình thẻ tại quầy hoặc khi đặt hàng!";
  }

  // 6. ĐỊA CHỈ & GIỜ MỞ CỬA
  if (q.includes('địa chỉ') || q.includes('ở đâu') || q.includes('giờ') || q.includes('mở cửa')) {
    return `📍 **Địa chỉ:** ${STORE.address} (Gần Bến xe Miền Đông cũ).\n🕒 **Giờ mở cửa:** 08:00 - 22:30 mỗi ngày!`;
  }

  // MẶC ĐỊNH
  return `Xin chào bạn! Mình là Trợ lý AI của **Trà Sữa Táo 🍎** (224 QL13, P.26, Bình Thạnh).\n\n` +
         `Bạn có thể đặt hàng trực tiếp bằng cách gõ câu như:\n` +
         `👉 *"Tính tiền: 2 ly trà đào, 1 đường đen, mình là sinh viên ship qua HUTECH"*\n` +
         `👉 *"Cho mình 3 trà sữa truyền thống ít ngọt ship bến xe miền đông"*\n\n` +
         `Mình sẽ tự động in hóa đơn chi tiết và gửi mã QR thanh toán ngay lập tức!`;
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const reply = smartAssistant(message);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server Trà Sữa Táo đang chạy tại cổng ${PORT}`);
});
