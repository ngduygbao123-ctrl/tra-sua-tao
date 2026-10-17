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

// BẢNG GIÁ 5 MÓN
const MENU = {
  'truyền thống': { name: 'Trà sữa truyền thống', price: 25000 },
  'đường đen': { name: 'Trà sữa trân châu đường đen', price: 32000 },
  'matcha': { name: 'Trà sữa matcha', price: 35000 },
  'đào': { name: 'Trà đào', price: 29000 },
  'vải': { name: 'Trà vải', price: 29000 }
};

// MÃ QR TỰ PHỤC HỒI THÔNG MINH (CHỐNG LỖI DẤU ? HOÀN TOÀN)
const QR_HTML = `
<div style="text-align: center; margin: 12px 0;">
  <img src="/qr.png" 
       onerror="this.onerror=null; this.src='https://img.vietqr.io/image/MB-2240139999-compact2.png?amount=0&addInfo=TRA%20SUA%20TAO%20224%20QL13';" 
       alt="Mã QR Thanh Toán" 
       style="width: 220px; max-width: 90%; border-radius: 12px; border: 2.5px solid #D32F2F; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: inline-block; background: #ffffff; padding: 4px;" />
  <p style="font-size: 0.8rem; color: #D32F2F; font-weight: bold; margin-top: 6px;">📲 Quét mã VietQR để thanh toán chuyển khoản 24/7</p>
</div>
`;

// 1. TÍNH PHÍ SHIP TỪ 224 QL13, BÌNH THẠNH
function calculateShippingFee(text) {
  const q = text.toLowerCase();

  if (q.includes('bến xe miền đông') || q.includes('bxmd') || q.includes('nguyễn xí') || 
      q.includes('đinh bộ lĩnh') || q.includes('chu văn an') || q.includes('tầm vu') || q.includes('1km') || q.includes('gần quán')) {
    return { fee: 10000, note: "Khoảng cách < 1km (Gần quán 224 QL13)" };
  }

  if (q.includes('hutech') || q.includes('ngoại thương') || q.includes('ftu') || q.includes('gtvt') || 
      q.includes('giao thông vận tải') || q.includes('ung văn khiêm') || q.includes('võ oanh') || 
      q.includes('d2') || q.includes('d5') || q.includes('thanh đa') || q.includes('2km') || q.includes('3km')) {
    return { fee: 15000, note: "Bán kính 1km - 3km (Khu vực ĐH Bình Thạnh)" };
  }

  if (q.includes('gò vấp') || q.includes('phú nhuận') || q.includes('thủ đức') || q.includes('quận 1') || q.includes('q1') || q.includes('5km')) {
    return { fee: 20000, note: "Bán kính 3km - 5km (Lân cận Bình Thạnh)" };
  }

  return { fee: 15000, note: "Nội thành Bình Thạnh" };
}

// 2. XUẤT THÔNG TIN THANH TOÁN
function getPaymentInfo() {
  return `💳 **HƯỚNG DẪN THANH TOÁN - TRÀ SỮA TÁO:**\n\n` +
         `Bạn có thể quét mã QR dưới đây hoặc chuyển khoản theo thông tin:\n` +
         QR_HTML +
         `• **Ngân hàng:** ${STORE.bankName}\n` +
         `• **Số tài khoản:** **${STORE.stk}**\n` +
         `• **Chủ tài khoản:** ${STORE.accountName}\n` +
         `• **Ví MoMo:** **${STORE.momo}**\n` +
         `• Hoặc thanh toán **Tiền mặt (COD)** khi nhận hàng.\n\n` +
         `*(Chuyển khoản xong bạn chỉ cần gửi ảnh biên lai cho quán để shipper lên đường ngay nhé!)*`;
}

// 3. TÍNH TIỀN HÓA ĐƠN & GẮN MÃ QR
function calculateBill(userText) {
  const q = userText.toLowerCase();
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

  const shipData = calculateShippingFee(q);
  let shipFee = shipData.fee;
  const totalQty = items.reduce((acc, cur) => acc + cur.qty, 0);

  let isFreeShip = false;
  if (totalQty >= 3 || subtotal >= 100000 || (shipFee === 10000 && totalQty >= 2)) {
    shipFee = 0;
    isFreeShip = true;
  }

  const finalTotal = subtotal - discount + shipFee;

  let res = `🧾 **HÓA ĐƠN ĐẶT HÀNG TỰ ĐỘNG:**\n`;
  res += `📍 *Xuất phát từ: 224 QL13, P.26, Q. Bình Thạnh*\n`;
  res += `----------------------------------------\n`;
  items.forEach(it => {
    res += `• ${it.name} x ${it.qty}: **${it.total.toLocaleString('vi-VN')}đ**\n`;
  });
  res += `----------------------------------------\n`;
  res += `• Tiền nước: **${subtotal.toLocaleString('vi-VN')}đ**\n`;
  if (hasStudentCard) {
    res += `• Ưu đãi Sinh viên (-10%): **-${discount.toLocaleString('vi-VN')}đ**\n`;
  }
  res += `• Phí ship (${shipData.note}): **${isFreeShip ? 'FREESHIP (0đ) 🎉' : shipFee.toLocaleString('vi-VN') + 'đ'}**\n`;
  res += `👉 **TỔNG CỘNG THANH TOÁN: ${finalTotal.toLocaleString('vi-VN')}đ**\n\n`;

  // GẮN MÃ QR VÀO HÓA ĐƠN
  res += `📱 **QUÉT MÃ QR ĐỂ THANH TOÁN:**\n`;
  res += QR_HTML;
  res += `• Hoặc trả **Tiền mặt khi nhận hàng (COD)**.\n`;
  res += `👉 Bạn nhắn cho quán **Địa chỉ nhận hàng cụ thể + SĐT** để quán giao liền nhé!`;

  return res;
}

// 4. BỘ ĐIỀU HƯỚNG TỔNG HỢP CỦA CHATBOT
function smartAssistant(userMessage) {
  const q = (userMessage || '').toLowerCase().trim();

  // A. HỎI VỀ THANH TOÁN TIỀN -> HIỆN MÃ QR NGAY
  if (q.includes('thanh toán') || q.includes('chuyển khoản') || q.includes('stk') || q.includes('qr') || q.includes('momo') || q.includes('trả tiền')) {
    return getPaymentInfo();
  }

  // B. TÍNH TIỀN HÓA ĐƠN
  if (q.includes('tính tiền') || q.includes('tổng cộng') || q.includes('hết bao nhiêu') || q.includes('đặt') || q.includes('cho mình')) {
    const bill = calculateBill(q);
    if (bill) return bill;
  }

  // C. PHÍ SHIP TỪ 224 QL13
  if (q.includes('ship') || q.includes('giao hàng') || q.includes('phí') || q.includes('bình thạnh')) {
    const shipCalc = calculateShippingFee(q);
    return `🛵 **CHÍNH SÁCH VẬN CHUYỂN TỪ 224 QL13, BÌNH THẠNH:**\n\n` +
           `• **Khu vực của bạn:** Cước khoảng **${shipCalc.fee.toLocaleString('vi-VN')}đ** (${shipCalc.note}).\n` +
           `• **Freeship:** Đơn từ **3 ly trở lên** hoặc bán kính gần < 1km.\n` +
           `• Đi xa quán luôn **đóng đá riêng trong túi zip** giữ lạnh!\n\n` +
           `Bạn cho quán xin địa chỉ cụ thể để tính cước chính xác nhất nhé!`;
  }

  // D. MENU
  if (q.includes('menu') || q.includes('món') || q.includes('giá') || q.includes('có gì')) {
    return "🍎 **MENU TRÀ SỮA TÁO (224 QL13, BÌNH THẠNH):**\n\n" +
           "1. Trà sữa truyền thống: **25.000đ**\n" +
           "2. Trà đào thanh mát: **29.000đ**\n" +
           "3. Trà vải thơm ngọt: **29.000đ**\n" +
           "4. Trà sữa trân châu đường đen: **32.000đ**\n" +
           "5. Trà sữa matcha Nhật Bản: **35.000đ**\n\n" +
           "🎁 Giảm 10% khi xuất trình thẻ HSSV tại quầy!";
  }

  // E. KHUYẾN MÃI
  if (q.includes('khuyến mãi') || q.includes('ưu đãi') || q.includes('giảm giá')) {
    return "🎁 Quán đang có chương trình: **Giảm ngay 10% trên tổng hóa đơn** dành riêng cho Học sinh - Sinh viên khi xuất trình thẻ tại quầy!";
  }

  // F. ĐỊA CHỈ & GIỜ MỞ CỬA
  if (q.includes('địa chỉ') || q.includes('ở đâu') || q.includes('giờ') || q.includes('mở cửa')) {
    return `📍 **Địa chỉ quán:** ${STORE.address} (Gần Bến xe Miền Đông cũ).\n🕒 **Giờ mở cửa:** 08:00 - 22:30 mỗi ngày!`;
  }

  // MẶC ĐỊNH
  return `Xin chào bạn! Mình là Trợ lý AI của **Trà Sữa Táo 🍎** (224 QL13, P.26, Bình Thạnh).\n\n` +
         `Bạn có thể gõ:\n` +
         `• 💳 *"Cho mình quét mã QR thanh toán"*\n` +
         `• 🧾 *"Tính tiền 2 ly trà đào ship qua HUTECH"*\n` +
         `• 🛵 *"Phí ship đến Bến xe Miền Đông là bao nhiêu?"*\n\n` +
         `Bạn cần quán hỗ trợ gì nào?`;
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const reply = smartAssistant(message);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server Trà Sữa Táo đang chạy tại cổng ${PORT}`);
});
