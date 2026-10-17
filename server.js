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

// BỘ XỬ LÝ CHUYÊN SÂU: PHÍ SHIP & CÁC CÂU HỎI KHÓ TỪ KHÁCH HÀNG
function getSmartAnswer(userMessage) {
  const q = (userMessage || '').toLowerCase().trim();

  // ================= 1. CHUYÊN ĐỀ: TẤT CẢ VỀ PHÍ SHIP & GIAO HÀNG =================
  
  // Bảng giá ship theo km chi tiết
  if (q.includes('phí ship') || q.includes('tiền ship') || q.includes('bao nhiêu km') || q.includes('tính ship') || q.includes('giá ship')) {
    return "🛵 **BẢNG PHÍ SHIP CHÍNH THỨC CỦA TRÀ SỮA TÁO:**\n\n" +
           "• **Dưới 1km (hoặc trong trường học):** Đồng giá **10.000đ** (Đơn từ 3 ly trở lên sẽ được **FREESHIP**).\n" +
           "• **Từ 1km - 3km:** **15.000đ - 20.000đ**.\n" +
           "• **Từ 3km - 5km:** **25.000đ**.\n" +
           "• **Trên 5km:** Tính cước trực tiếp theo ứng dụng đối tác vận chuyển (Grab / ShopeeFood / Ahamove).\n\n" +
           "👉 Bạn nhắn địa chỉ cụ thể để quán tính phí ship ưu đãi nhất cho bạn nhé!";
  }

  // Freeship / Miễn phí ship
  if (q.includes('freeship') || q.includes('miễn phí ship') || q.includes('free ship') || q.includes('bao nhiêu ly được freeship')) {
    return "🎉 **CHÍNH SÁCH FREESHIP CỦA QUÁN:**\n\n" +
           "1. **Bán kính dưới 1km (khu vực KTX, trường học):** Freeship ngay cho đơn từ **3 ly** trở lên.\n" +
           "2. **Bán kính dưới 3km:** Freeship cho hóa đơn từ **100.000đ**.\n" +
           "3. **Đơn họp lớp, câu lạc bộ từ 10 ly:** Luôn luôn được hỗ trợ Freeship tận nơi!\n" +
           "Rủ bạn bè cùng phòng đặt chung là được Freeship ngay đó bạn ơi!";
  }

  // Sợ đá tan / Đi xa bị nhạt trà
  if (q.includes('đá tan') || q.includes('tan đá') || q.includes('nhạt') || q.includes('đóng đá riêng') || q.includes('để đá riêng')) {
    return "❄️ **Yên tâm về chất lượng khi Ship đi xa:**\n\n" +
           "• Với các đơn giao trên 15 phút hoặc khi khách yêu cầu, quán sẽ **TỰ ĐỘNG ĐÓNG ĐÁ RIÊNG** trong túi zip sạch sẽ và bảo quản trong túi giữ nhiệt.\n" +
           "• Khi shipper giao tới nơi, ly trà của bạn vẫn đậm đặc nguyên vị như uống trực tiếp tại quán!";
  }

  // Thời gian giao hàng & Mưa gió
  if (q.includes('bao lâu') || q.includes('mấy phút') || q.includes('trời mưa') || q.includes('mưa có ship')) {
    return "⏱️ **Thời gian giao hàng:**\n\n" +
           "• **Đơn thông thường:** Từ 15 - 30 phút tùy khoảng cách.\n" +
           "• **Khi trời mưa hoặc giờ cao điểm:** Có thể chậm hơn 10 - 15 phút do shipper phải di chuyển an toàn. Rất mong bạn thông cảm giúp các bác tài nha!";
  }

  // Khách bận không nhận hàng được / Hẹn giờ giao
  if (q.includes('hẹn giờ') || q.includes('chưa nhận được') || q.includes('bận chưa lấy')) {
    return "⏰ Quán có nhận **HẸN GIỜ GIAO TẬN TAY** nhé! Bạn chỉ cần báo trước giờ ra chơi hoặc giờ tan ca ít nhất 30 phút, quán sẽ canh chuẩn giờ để shipper mang trà sữa tới cho bạn!";
  }

  // ================= 2. BỘ CÂU HỎI KHÓ & TÌNH HUỐNG HÓC BÚA =================

  // Nguồn gốc, hóa chất, sợ bẩn, an toàn thực phẩm
  if (q.includes('bẩn') || q.includes('hóa chất') || q.includes('nguồn gốc') || q.includes('sạch không') || q.includes('trung quốc') || q.includes('an toàn')) {
    return "🛡️ **Cam kết Vệ sinh An toàn Thực phẩm 100%:**\n\n" +
           "• **Trà:** Sử dụng lá trà khô chọn lọc từ các nông trường trà Bảo Lộc (Lâm Đồng), ủ tươi mỗi sáng bằng nước sôi đạt chuẩn.\n" +
           "• **Sữa:** Sử dụng sữa thanh trùng và bột kem thực vật đạt chuẩn kiểm định của Bộ Y Tế, tuyệt đối KHÔNG dùng hương liệu trôi nổi.\n" +
           "• **Trân châu:** Tự nấu mới mỗi 3 - 4 tiếng bằng bột năng nguyên chất và đường đen tự nhiên. Bạn hoàn toàn có thể yên tâm thưởng thức nhé!";
  }

  // Giảm cân, tiểu đường, sợ mập, ăn kiêng, calo
  if (q.includes('giảm cân') || q.includes('béo') || q.includes('mập') || q.includes('tiểu đường') || q.includes('calo') || q.includes('ăn kiêng')) {
    return "🥗 **Gợi ý chuẩn 'Healthy' cho người sợ béo/ăn kiêng:**\n\n" +
           "• **Nên chọn:** **Trà đào** hoặc **Trà vải** với mức **0% đường (hoặc 30% đường)**. Dòng trà trái cây này chỉ có khoảng 60 - 80 kcal, cực kỳ thanh nhẹ và không gây tăng cân.\n" +
           "• **Nên tránh:** Trà sữa trân châu đường đen (chứa khoảng 350 - 450 kcal do có bột sữa và đường caramel cô đặc).\n\n" +
           "Bạn muốn mình lấy 1 ly Trà đào 0% đường giải nhiệt nhé?";
  }

  // Dị ứng sữa / Không dung nạp Lactose
  if (q.includes('dị ứng') || q.includes('lactose') || q.includes('đau bụng') || q.includes('uống sữa bị')) {
    return "⚠️ **Tư vấn cho bạn có cơ địa nhạy cảm với sữa bò:**\n\n" +
           "• Nếu bạn bị dị ứng đạm sữa hoặc không dung nạp Lactose, **hãy chọn Trà Đào (29k) hoặc Trà Vải (29k)**. Hai món này là 100% trà trái cây nguyên chất, KHÔNG chứa bất kỳ thành phần sữa nào!\n" +
           "• Không nên gọi Trà sữa truyền thống, Trân châu đường đen hay Matcha vì đều có thành phần từ sữa bạn nhé!";
  }

  // Khách chê đắt / So sánh giá với quán khác
  if (q.includes('đắt') || q.includes('mắc') || q.includes('bên kia bán') || q.includes('15k') || q.includes('20k')) {
    return "Dạ quán rất thấu hiểu băn khoăn về giá của bạn ạ! Mức giá 25k - 35k tại Trà Sữa Táo được tối ưu để đảm bảo:\n" +
           "1. Cốt trà thật ủ mới mỗi ngày, không dùng phẩm màu độc hại.\n" +
           "2. Trân châu dẻo mềm nấu mới liên tục.\n" +
           "3. Không gian có máy lạnh, wifi mạnh để học bài thoải mái.\n\n" +
           "Đặc biệt nếu bạn là học sinh/sinh viên thì quán **giảm ngay 10%** khi mang thẻ, giá chỉ còn hơn 20k/ly thôi đó ạ!";
  }

  // Mua số lượng lớn / Mặc cả / Giảm giá theo nhóm
  if (q.includes('mua nhiều') || q.includes('số lượng lớn') || q.includes('10 ly') || q.includes('20 ly') || q.includes('bớt không') || q.includes('giảm thêm')) {
    return "🤝 **Chính sách ưu đãi cho đơn số lượng lớn (Họp lớp, CLB, Sự kiện):**\n\n" +
           "• Đơn từ **10 ly trở lên**: FREESHIP + Tặng kèm topping trân châu hoặc giảm thêm 5%.\n" +
           "• Đơn từ **20 ly trở lên**: Chiết khấu trực tiếp 10% - 15% tổng hóa đơn.\n" +
           "Bạn nhắn số lượng dự kiến và giờ cần giao để quán chuẩn bị chu đáo nhất nhé!";
  }

  // Dị vật trong ly / Nước bị chua, hỏng
  if (q.includes('dị vật') || q.includes('ruồi') || q.includes('sâu') || q.includes('chua') || q.includes('hỏng') || q.includes('thiu')) {
    return "🚨 **XỬ LÝ KHẨN CẤP VỀ CHẤT LƯỢNG:**\n\n" +
           "Dạ quán chân thành xin lỗi bạn vì sự cố nghiêm trọng này! Vệ sinh an toàn là ưu tiên sống còn của quán. Bạn vui lòng giữ lại ly nước, chụp hình gửi ngay Hotline: **0900.123.456**.\n" +
           "Quán cam kết: **ĐỔI LY MỚI NGAY LẬP TỨC TRONG 20 PHÚT** hoặc **HOÀN TIỀN 100%** kèm quà tặng xin lỗi bạn!";
  }

  // Xin nợ tiền / Cho uống chịu
  if (q.includes('nợ') || q.includes('uống chịu') || q.includes('cho thiếu') || q.includes('mai trả')) {
    return "Hihi quán rất quý bạn nhưng vì quy định kiểm toán cuối ca của thu ngân nên quán chưa hỗ trợ bán nợ được ạ! Bạn có thể chuyển khoản online qua MoMo hoặc VietQR chỉ mất 3 giây thôi nè!";
  }

  // Xin công thức pha chế
  if (q.includes('công thức') || q.includes('bí quyết') || q.includes('cách nấu') || q.includes('pha thế nào')) {
    return "Bí quyết ngon nhất của quán nằm ở việc chọn búp trà Bảo Lộc tươi và tình cảm của đội ngũ pha chế gửi gắm vào từng ly trà! Công thức chi tiết là bí mật của bác pha chế rồi, nhưng khi nào thèm bạn cứ ghé quán để tụi mình phục vụ tận tình nha!";
  }

  // ================= 3. CÁC CÂU HỎI TIÊU CHUẨN KHÁC =================

  // Menu
  if (q.includes('menu') || q.includes('món') || q.includes('giá') || q.includes('có gì')) {
    return "🍎 **MENU TRÀ SỮA TÁO CHUẨN GIÁ HÔM NAY:**\n\n" +
           "1. Trà sữa truyền thống: **25.000đ**\n" +
           "2. Trà đào thanh nhiệt: **29.000đ**\n" +
           "3. Trà vải sảng khoái: **29.000đ**\n" +
           "4. Trà sữa trân châu đường đen: **32.000đ** (Best-Seller)\n" +
           "5. Trà sữa matcha Nhật Bản: **35.000đ**\n\n" +
           "Tùy chọn: Đường (0% - 100%), Đá (Không đá, 50%, 100%). Bạn muốn chọn món nào?";
  }

  // Dưới 35k
  if (q.includes('35') || q.includes('rẻ') || q.includes('ngân sách')) {
    return "💰 **Món dưới 35k ngon bổ rẻ:**\n" +
           "• 25k: Trà sữa truyền thống\n" +
           "• 29k: Trà đào hoặc Trà vải\n" +
           "• 32k: Trà sữa trân châu đường đen\n" +
           "Món nào cũng chuẩn ngon dưới 35k bạn nha!";
  }

  // Giờ mở cửa & Địa chỉ
  if (q.includes('giờ') || q.includes('địa chỉ') || q.includes('ở đâu')) {
    return "📍 **Địa chỉ:** Kios Trà Sữa Táo - Khuôn viên trường / Phố sinh viên.\n🕒 **Giờ mở cửa:** 08:00 - 22:30 hàng ngày (kể cả Thứ 7, CN và ngày lễ)!";
  }

  // Khuyến mãi
  if (q.includes('khuyến mãi') || q.includes('ưu đãi') || q.includes('giảm giá')) {
    return "🎁 **Ưu đãi hiện có:** Giảm ngay **10% trên tổng bill** cho tất cả HSSV khi xuất trình thẻ tại quầy!";
  }

  // Khiếu nại thông thường
  if (q.includes('khiếu nại') || q.includes('nhầm') || q.includes('sai')) {
    return "📞 Dạ rất tiếc vì sự cố nhầm món! Bạn giữ lại hóa đơn và gọi Hotline: **0900.123.456** để quán điều phối nhân viên đổi ngay ly đúng cho bạn nhé!";
  }

  // Mặc định
  return "Xin chào bạn! Mình là Trợ lý ảo của **Trà Sữa Táo 🍎**.\n\n" +
         "Mình có thể giải đáp tường tận mọi thắc mắc về:\n" +
         "• 🛵 Bảng phí ship, freeship, thời gian giao hàng\n" +
         "• 📋 Menu, món bán chạy, tư vấn theo túi tiền\n" +
         "• 🥗 Đồ uống cho người ăn kiêng, dị ứng sữa, an toàn thực phẩm\n\n" +
         "Bạn cần mình hỗ trợ điều gì nào?";
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const reply = getSmartAnswer(message);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Server Trà Sữa Táo đang hoạt động tại cổng ${PORT}`);
});
