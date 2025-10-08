<template>
  <div class="chatbot">
    <!-- Nút hình tròn tư vấn -->
    <div class="chat-toggle" v-if="!isChatOpen" @click="toggleChat">
      <img src="../assets/images/message-icon.svg" alt="Chat Icon" />
    </div>
    <!-- Box chat -->
    <div name="fade">
      <div v-if="isChatOpen" class="chat-container">
        <div class="chat-header">
          <h3>Chatbot Tư Vấn</h3>
          <span class="close-button" @click="toggleChat">✖</span>
        </div>
        <div class="chat-window" ref="chatWindow">
          <div v-for="(msg, index) in messages" :key="index" :class="msg.role">
            <div class="message-bubble">
              <!-- Tin nhắn người dùng -->
              <template v-if="msg.role === 'user'">
                {{ msg.content.message }}
              </template>
              <!-- Tin nhắn bot -->
              <template v-else>
                <span v-html="formatMessage(msg.content.message)"></span>
                <!-- Hiển thị iframe bản đồ nếu message chứa từ khóa "Bản đồ" -->
                <iframe
                  v-if="msg.content.message && msg.content.message.includes('Bản đồ')"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.2922764180553!2d105.78484157449498!3d20.980917989421535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accdd8a1ad71%3A0xa2f9b16036648187!2zSOG7jWMgdmnhu4duIEPDtG5nIG5gaOG7hyBCxrB1IGNow61uaCB2aeG7hW4gdGjDtG5n!5e0!3m2!1svi!2s!4v1746953082341!5m2!1svi!2s"
                  class="map-iframe"
                  style="border:0;"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
              </template>
            </div>
          </div>
          <!-- Loading indicator -->
          <div v-if="loading" class="bot loading">
            <div class="message-bubble">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          :disabled="loading"
          placeholder="Nhập câu hỏi..."
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Chatbot',
  data() {
    return {
      messages: [],
      userInput: '',
      isChatOpen: false,
      loading: false,
    };
  },
  methods: {
    toggleChat() {
      this.isChatOpen = !this.isChatOpen;
    },
    async sendMessage() {
      if (!this.userInput.trim()) return;

      // Thêm tin nhắn người dùng
      this.messages.push({ role: 'user', content: { message: this.userInput } });

      // Gọi API với loading state
      this.loading = true;
      this.$nextTick(() => this.scrollToBottom());
      try {
        const response = await axios.post('http://localhost:3000/chatbot/chat', {
          message: this.userInput,
        });
        console.log('API response:', response.data);
        this.messages.push({ role: 'bot', content: response.data });
      } catch (error) {
        console.error('API error:', error.message, error.response?.data);
        this.messages.push({
          role: 'bot',
          content: {
            message: error.response?.data?.message || 'Lỗi kết nối server, vui lòng thử lại!',
          },
        });
      } finally {
        this.loading = false;
      }

      this.userInput = '';
      // Cuộn xuống cuối chat window
      this.$nextTick(() => {
        const chatWindow = this.$refs.chatWindow;
        chatWindow.scrollTop = chatWindow.scrollHeight;
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatWindow = this.$refs.chatWindow;
        if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
      });
    },
    formatMessage(message) {
      if (!message) return 'Phản hồi không hợp lệ từ server.';

      // Thay \n bằng <br>
      let formatted = message.replace(/\n/g, '<br>');

      // Tách và xử lý URL, bảo vệ thẻ <img>
      const parts = formatted.split(/(<img[^>]+>)/);
      return parts
        .map(part => {
          // Nếu là thẻ <img>, giữ nguyên
          if (part.startsWith('<img')) {
            return part;
          }
          // Nếu không, thay URL bằng thẻ <a>
          return part.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" style="color: #007bff; text-decoration: underline;">Chi tiết tại đây</a>'
          );
        })
        .join('');
    },
  },
};
</script>

<style scoped>
.chatbot {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-toggle {
  width: 60px;
  height: 60px;
  background: #ae9a64;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.chat-toggle img {
  width: 25px;
  height: 25px;
}

.chat-toggle:hover {
  background: #fbcf67;
}

.chat-container {
  width: 320px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.chat-header {
  background: #ae9a64;
  color: white;
  padding: 10px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.chat-header .close-button {
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
}

.chat-header .close-button:hover {
  color: #f0f0f0;
}

.chat-window {
  height: 400px;
  overflow-y: auto;
  padding: 15px;
  background: #f9f9f9;
}

.user,
.bot {
  display: flex;
  margin-bottom: 10px;
}

.user {
  justify-content: flex-end;
}

.bot {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 15px;
  line-height: 1.4;
  word-wrap: break-word;
  font-size: 14px;
}

.user .message-bubble {
  background: #ae9a64;
  color: white;
  border-bottom-right-radius: 5px;
}

.bot .message-bubble {
  background: #e9ecef;
  color: #333;
  border-bottom-left-radius: 5px;
}

.bot .message-bubble a {
  color: #007bff;
  text-decoration: underline;
}

.bot .message-bubble a:hover {
  color: #0056b3;
}

.bot .message-bubble img {
  margin-top: 5px;
  border-radius: 5px;
}

.map-iframe {
  width: 100%;
  height: 200px;
  margin-top: 10px;
  border-radius: 8px;
}

input {
  width: 100%;
  padding: 15px 12px;
  border: none;
  border-top: 1px solid #ccc;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  outline: none;
  font-size: 14px;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Spinner */
.spinner {
  width: 28px;
  height: 28px;
  border: 4px solid rgba(0,0,0,0.1);
  border-left-color: #ae9a64;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>