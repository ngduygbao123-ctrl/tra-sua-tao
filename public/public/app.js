const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
let history = [];

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}-message`;
  msg.innerHTML = `<div class="msg-bubble">${text}</div>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMsg(text) {
  if (!text.trim()) return;
  appendMessage('user', text);
  userInput.value = '';

  appendMessage('bot', '🍎 Đang suy nghĩ...');
  const loadingElem = chatMessages.lastElementChild;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history })
    });
    const data = await res.json();
    loadingElem.remove();
    appendMessage('bot', data.reply || data.error);
    history.push({ role: 'user', text: text });
    history.push({ role: 'model', text: data.reply });
  } catch (err) {
    loadingElem.remove();
    appendMessage('bot', 'Lỗi kết nối máy chủ!');
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMsg(userInput.value);
});

function sendQuick(promptText) {
  sendMsg(promptText);
}
