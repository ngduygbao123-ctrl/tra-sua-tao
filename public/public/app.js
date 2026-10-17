window.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  let history = [];

  function appendMessage(sender, text) {
    if (!chatMessages) return;
    const msg = document.createElement('div');
    msg.className = 'message ' + sender + '-message';
    msg.innerHTML = '<div class="msg-bubble">' + text + '</div>';
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMsg(text) {
    if (!text || !text.trim()) return;
    appendMessage('user', text);
    if (userInput) userInput.value = '';

    appendMessage('bot', '🍎 Đang suy nghĩ...');
    const loadingElem = chatMessages.lastElementChild;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history })
      });
      const data = await res.json();
      if (loadingElem) loadingElem.remove();

      const replyText = data.reply || data.error || 'Quán chưa ghi nhận được câu hỏi.';
      appendMessage('bot', replyText);

      if (data.reply) {
        history.push({ role: 'user', text: text });
        history.push({ role: 'model', text: data.reply });
      }
    } catch (err) {
      if (loadingElem) loadingElem.remove();
      appendMessage('bot', 'Lỗi kết nối máy chủ! Vui lòng thử lại.');
    }
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (userInput) sendMsg(userInput.value);
    });
  }

  // Khai báo ra ngoài window để các nút bấm gợi ý (Menu, Khuyến mãi...) nhận diện được
  window.sendQuick = function(promptText) {
    sendMsg(promptText);
  };
});
