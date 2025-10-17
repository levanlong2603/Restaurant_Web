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
          <h3>{{ $t('chatbot.title') }}</h3>
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
                <!-- Hiển thị iframe bản đồ nếu bot trả về link bản đồ hoặc chứa từ khóa 'Bản đồ' -->
                <iframe
                  v-if="getMapEmbedUrl(msg.content.message)"
                  :src="getMapEmbedUrl(msg.content.message)"
                  class="map-iframe"
                  style="border:0;"
                  allowfullscreen
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
          :placeholder="$t('chatbot.inputPlaceholder')"
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
            message: error.response?.data?.message || this.$t('chatbot.error')
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
    // Try to extract a Google Maps link from the bot message and return an embeddable URL
    getMapEmbedUrl(message) {
      if (!message || typeof message !== 'string') return null;
      // First look for explicit Google Maps URL
      const urlMatch = message.match(/https?:\/\/(www\.)?google\.com\/maps[^\s<]*/i);
      if (urlMatch) {
        const url = urlMatch[0];
        // If it's already an embed URL (contains /embed or output=embed), return as-is
        if (url.includes('/embed') || url.includes('output=embed')) return url;
        // If it's a search link, convert to embed search
        if (url.includes('/search') || url.includes('query=')) {
          // Extract query param if present
          const q = (url.match(/query=([^&]+)/) || [null, null])[1];
          if (q) return `https://www.google.com/maps?q=${q}&output=embed`;
          return `https://www.google.com/maps${url.split('google.com/maps')[1]}&output=embed`;
        }
        // If it's a place URL, try to use as embed by replacing /place/ with /embed?pb=/place/
        if (url.includes('/place/')) {
          return url.replace('/place/', '/embed?pb=/place/');
        }
        // Fallback: return a search embed for the whole URL encoded string
        return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
      }
      // As fallback: if message contains the word 'Bản đồ' but no URL, embed Số 33 Đại Mỗ
      if (message.includes('Bản đồ')) {
        return 'https://www.google.com/maps?q=S%E1%BB%91%2033,%20%C4%91%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93,%20ph%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20M%E1%BB%93,%20Qu%E1%BA%ADn%20Nam%20T%E1%BB%AB%20Li%C3%AAm,%20H%C3%A0%20N%E1%BB%99i&output=embed';
      }
      return null;
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
  font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif; /* Đồng nhất font */
}

.chat-toggle {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #8B5E3C 0%, #6B4226 100%); /* Gradient nâu */
  color: #FFF8E7; /* Trắng kem */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(107, 66, 38, 0.3); /* Bóng nâu */
  border: 2px solid #E7C27D; /* Viền vàng */
  transition: all 0.3s ease;
  font-family: inherit; /* Kế thừa font */
}

.chat-toggle img {
  width: 25px;
  height: 25px;
  filter: brightness(0) invert(1); /* Đảm bảo icon màu trắng */
}

.chat-toggle:hover {
  background: linear-gradient(135deg, #E7C27D 0%, #8B5E3C 100%); /* Gradient vàng đến nâu */
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(231, 194, 125, 0.4);
}

.chat-container {
  width: 320px;
  background: #FFF8E7; /* Trắng kem */
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3); /* Bóng nâu */
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  border: 2px solid #E7C27D; /* Viền vàng */
  font-family: inherit; /* Kế thừa font */
}

.chat-header {
  background: linear-gradient(135deg, #6B4226 0%, #8B5E3C 100%); /* Gradient nâu */
  color: #FFF8E7; /* Trắng kem */
  padding: 15px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: inherit; /* Kế thừa font */
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  font-family: inherit; /* Kế thừa font */
}

.chat-header .close-button {
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  color: #FFF8E7; /* Trắng kem */
  transition: all 0.3s ease;
  font-family: inherit; /* Kế thừa font */
}

.chat-header .close-button:hover {
  color: #E7C27D; /* Vàng nhạt */
  transform: scale(1.1);
}

.chat-window {
  height: 400px;
  overflow-y: auto;
  padding: 15px;
  background: #FFF8E7; /* Trắng kem */
  border-bottom: 1px solid rgba(139, 94, 60, 0.1); /* Viền nâu nhạt */
}

/* Custom scrollbar */
.chat-window::-webkit-scrollbar {
  width: 6px;
}

.chat-window::-webkit-scrollbar-track {
  background: rgba(231, 194, 125, 0.1);
  border-radius: 3px;
}

.chat-window::-webkit-scrollbar-thumb {
  background: #E7C27D; /* Vàng nhạt */
  border-radius: 3px;
}

.chat-window::-webkit-scrollbar-thumb:hover {
  background: #8B5E3C; /* Nâu gỗ */
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
  background: #8B5E3C; /* Nâu gỗ */
  color: white;
  border-bottom-right-radius: 5px;
}

.bot .message-bubble {
  background: rgba(231, 194, 125, 0.2); /* Vàng nhạt trong suốt */
  color: #3B2F2F; /* Đen nâu */
  border-bottom-left-radius: 5px;
  border: 1px solid rgba(231, 194, 125, 0.3);
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.1);
}

.bot .message-bubble a {
  color: #8B5E3C; /* Nâu gỗ */
  text-decoration: underline;
  font-weight: 600;
  transition: all 0.3s ease;
}

.bot .message-bubble a:hover {
  color: #6B4226; /* Nâu đất */
}

.bot .message-bubble img {
  margin-top: 5px;
  border-radius: 5px;
  border: 1px solid #E7C27D; /* Viền vàng */
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
  border-top: 1px solid #E7C27D; /* Vàng nhạt */
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  outline: none;
  font-size: 14px;
  background: #FFF8E7; /* Trắng kem */
  color: #3B2F2F; /* Đen nâu */
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
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
  border: 4px solid rgba(231, 194, 125, 0.3); /* Vàng nhạt trong suốt */
  border-left-color: #8B5E3C; /* Nâu gỗ */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Quick replies */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.quick-reply {
  background: rgba(139, 94, 60, 0.1); /* Nâu gỗ trong suốt */
  color: #6B4226; /* Nâu đất */
  border: 1px solid rgba(139, 94, 60, 0.3);
  padding: 8px 12px;
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.quick-reply:hover {
  background: rgba(139, 94, 60, 0.2);
  transform: translateY(-1px);
}

/* Timestamp */
.message-time {
  font-size: 10px;
  color: #8B5E3C; /* Nâu gỗ */
  margin-top: 5px;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 480px) {
  .chatbot {
    bottom: 10px;
    right: 10px;
  }
  
  .chat-container {
    width: 280px;
  }
  
  .chat-toggle {
    width: 50px;
    height: 50px;
  }
  
  .chat-toggle img {
    width: 20px;
    height: 20px;
  }
  
  .message-bubble {
    max-width: 80%;
    font-size: 13px;
    padding: 10px 14px;
  }
}
</style>