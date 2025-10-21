<template>
  <div class="reservation-page">
    <Header />
    <section class="reservation">
      <div class="reservation-content">
        <h1 class="page-title">ĐẶT BÀN</h1>
        <p class="description">
          Đặt bàn trước sẽ giúp quý khách lựa chọn được chỗ ngồi ứng ý và sự chuẩn bị chu đáo nhất.
        </p>

        <div class="divider"></div>

        <div class="reservation-form">
          <h2 class="form-title">THÔNG TIN NGƯỜI ĐẶT</h2>
          <form @submit.prevent="submitReservation">
            <!-- Nhóm thông tin cá nhân -->
            <div class="form-section">
              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Họ tên <span class="required">*</span></label>
                  <input
                    type="text"
                    v-model="form.name"
                    required
                    placeholder="Nhập họ tên"
                    :disabled="isSubmitting"
                    class="form-input"
                  />
                </div>
                <div class="form-field">
                  <label class="field-label">Số điện thoại <span class="required">*</span></label>
                  <input
                    type="tel"
                    v-model="form.phoneNumber"
                    required
                    placeholder="Nhập số điện thoại"
                    :disabled="isSubmitting"
                    class="form-input"
                  />
                </div>
              </div>
            </div>
            
            <!-- Nhóm thông tin đặt bàn -->
            <div class="form-section">
              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Ngày đặt <span class="required">*</span></label>
                  <div class="date-input-container">
                    <input 
                      type="date" 
                      v-model="form.date" 
                      required 
                      :min="minDate"
                      :disabled="isSubmitting"
                      class="form-input date-input"
                    />
                  </div>
                </div>
                <div class="form-field">
                  <label class="field-label">Giờ đặt <span class="required">*</span></label>
                  <select v-model="form.time" required :disabled="isSubmitting" class="form-select">
                    <option value="">Chọn giờ</option>
                    <option v-for="slot in timeSlots" :key="slot" :value="slot">
                      {{ slot }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-field">
                  <label class="field-label">Số lượng khách <span class="required">*</span></label>
                  <div class="people-input-container">
                    <input
                      type="number"
                      v-model.number="form.num_people"
                      min="1"
                      max="20"
                      required
                      placeholder="Số lượng khách"
                      :disabled="isSubmitting"
                      class="form-input people-input"
                    />
                    <span class="people-suffix">người</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ghi chú -->
            <div class="form-section">
              <div class="form-field notes-field">
                <label class="field-label">Lưu ý</label>
                <textarea
                  v-model="form.notes"
                  placeholder="Nhập lưu ý (nếu có)"
                  rows="3"
                  :disabled="isSubmitting"
                  class="form-textarea"
                ></textarea>
              </div>
            </div>

            <!-- Thông báo lưu ý -->
            <div class="reservation-note">
              <p class="note-title"><strong>LƯU Ý ĐẶT BÀN</strong></p>
              <p class="note-text">Quý khách vui lòng đến trước thời gian đặt 15 phút để nhà hàng phục vụ quý khách được tốt nhất.</p>
              <p class="note-text">Cảm ơn quý khách!</p>
            </div>

            <!-- Nút gửi -->
            <button
              type="submit"
              class="reserve-button"
              :class="{ 
                'submitted': isSubmitted, 
                'loading': isSubmitting,
                'success': isSubmitted
              }"
              :disabled="isSubmitting || isSubmitted"
            >
              <span v-if="isSubmitting" class="button-spinner"></span>
              <span v-else-if="isSubmitted" class="button-checkmark">✓</span>
              <span class="button-text">{{ getButtonText() }}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
    <Footer />
    <Chatbot />

    <!-- Modal thông báo thành công -->
    <div v-if="isSubmitted" class="success-modal-overlay" @click="closeSuccessModal">
      <div class="success-modal" @click.stop>
        <div class="success-modal-content">
          <div class="success-icon">✓</div>
          <h3 class="success-title">ĐẶT BÀN THÀNH CÔNG!</h3>
          <p class="success-message">Cảm ơn quý khách <strong>{{ form.name }}</strong> đã đặt bàn tại nhà hàng chúng tôi.</p>
          <div class="reservation-details">
            <p class="details-title"><strong>Thông tin đặt bàn:</strong></p>
            <div class="detail-item">
              <span class="detail-icon">📅</span>
              <span class="detail-text">Ngày: {{ formatDate(form.date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">⏰</span>
              <span class="detail-text">Giờ: {{ form.time }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">👥</span>
              <span class="detail-text">Số lượng: {{ form.num_people }} người</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">📞</span>
              <span class="detail-text">Liên hệ: {{ form.phoneNumber }}</span>
            </div>
          </div>
          <p class="confirmation-message">Chúng tôi sẽ liên hệ với quý khách trong thời gian sớm nhất để xác nhận.</p>
          <button class="close-modal-button" @click="closeSuccessModal">
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Chatbot from '@/components/Chatbot.vue'

export default {
  name: 'Reservation',
  components: { 
    Header, 
    Footer,
    Chatbot
  },
  data() {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return {
      form: {
        name: '',
        phoneNumber: '',
        num_people: 2,
        date: tomorrow.toISOString().split('T')[0],
        time: '20:00',
        notes: '',
        tables: []
      },
      timeSlots: [
        '11:00', '11:30', '12:00', '12:30',
        '17:00', '17:30', '18:00', '18:30',
        '19:00', '19:30', '20:00', '20:30',
        '21:00', '21:30'
      ],
      isSubmitting: false,
      isSubmitted: false,
      minDate: new Date().toISOString().split('T')[0]
    }
  },
  methods: {
    getButtonText() {
      if (this.isSubmitting) return 'ĐANG XỬ LÝ...'
      if (this.isSubmitted) return 'ĐÃ GỬI THÀNH CÔNG'
      return 'ĐẶT BÀN'
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    async submitReservation() {
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      try {
        const reservation_time = `${this.form.date}T${this.form.time}`
        const payload = {
          name: this.form.name,
          phoneNumber: this.form.phoneNumber,
          reservation_time,
          num_people: this.form.num_people,
          notes: this.form.notes,
          tables: this.form.tables
        }

        const response = await axios.post('http://localhost:3000/reservation', payload)
        
        this.isSubmitting = false
        this.isSubmitted = true
        
      } catch (error) {
        console.error('Lỗi khi đặt bàn:', error)
        this.isSubmitting = false
        alert('Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.')
      }
    },
    
    closeSuccessModal() {
      this.isSubmitted = false
      this.resetForm()
    },
    
    validateForm() {
      if (!this.form.name.trim()) {
        alert('Vui lòng nhập họ tên')
        return false
      }
      
      if (!this.form.phoneNumber.trim()) {
        alert('Vui lòng nhập số điện thoại')
        return false
      }
      
      const phoneRegex = /^[0-9]{10,11}$/
      if (!phoneRegex.test(this.form.phoneNumber.replace(/\s/g, ''))) {
        alert('Vui lòng nhập số điện thoại hợp lệ (10-11 số)')
        return false
      }
      
      if (!this.form.date) {
        alert('Vui lòng chọn ngày đặt')
        return false
      }
      
      if (!this.form.time) {
        alert('Vui lòng chọn giờ đặt')
        return false
      }
      
      if (!this.form.num_people || this.form.num_people < 1) {
        alert('Vui lòng nhập số lượng khách hợp lệ')
        return false
      }
      
      return true
    },
    
    resetForm() {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      this.form = {
        name: '',
        phoneNumber: '',
        num_people: 2,
        date: tomorrow.toISOString().split('T')[0],
        time: '20:00',
        notes: '',
        tables: []
      }
    }
  }
}
</script>

<style scoped>
.reservation-page {
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #ffffff;
}

.reservation {
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 15px 40px;
}

/* Tiêu đề trang */
.page-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #fbcf67;
  text-align: center;
  text-shadow: 0 0 5px #fbcf67, 0 0 30px #fbcf67;
  line-height: 1.2;
}

.description {
  font-size: 15px;
  color: #ffffff;
  margin-bottom: 30px;
  text-align: center;
  line-height: 1.5;
  opacity: 0.9;
}

.divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 25px 0;
}

/* Form */
.form-title {
  font-size: 20px;
  color: #fbcf67;
  margin-bottom: 25px;
  text-align: left;
  font-weight: bold;
}

.form-section {
  margin-bottom: 25px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.form-field {
  flex: 1;
  text-align: left;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #fbcf67;
  margin-bottom: 8px;
}

.required {
  color: #ff4757;
}

/* Input styles */
.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 14px 16px;
  background-color: #f6f6f3;
  border: 1px solid #444;
  color: #333;
  border-radius: 8px;
  font-size: 16px; /* Tăng font size cho mobile */
  box-sizing: border-box;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  appearance: none;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #fbcf67;
  box-shadow: 0 0 5px rgba(251, 207, 103, 0.5);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Date input customization */
.date-input-container {
  position: relative;
}

.date-input::-webkit-calendar-picker-indicator {
  padding: 8px;
  cursor: pointer;
  filter: invert(0.5);
}

/* People input with suffix */
.people-input-container {
  position: relative;
}

.people-suffix {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
  pointer-events: none;
}

.people-input {
  padding-right: 60px;
}

/* Select customization */
.form-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
}

/* Textarea */
.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

/* Notes section */
.notes-field {
  margin-bottom: 0;
}

/* Reservation note */
.reservation-note {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: left;
  border-left: 4px solid #fbcf67;
}

.note-title {
  margin-bottom: 12px;
  line-height: 1.4;
  color: #fbcf67;
  font-size: 15px;
}

.note-text {
  margin-bottom: 10px;
  line-height: 1.5;
  font-size: 14px;
  opacity: 0.9;
}

.note-text:last-child {
  margin-bottom: 0;
}

/* Reserve button */
.reserve-button {
  background-color: #fbcf67;
  color: #1a1a1a;
  border: none;
  padding: 18px 30px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  min-height: 60px;
  box-shadow: 0 4px 15px rgba(251, 207, 103, 0.3);
}

.reserve-button:hover:not(:disabled) {
  background-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 207, 103, 0.4);
}

.reserve-button:active:not(:disabled) {
  transform: translateY(0);
}

.reserve-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.reserve-button.loading {
  background-color: #e0e0e0;
  color: #666;
}

.reserve-button.success {
  background-color: #4CAF50;
  color: white;
}

/* Hiệu ứng loading spinner */
.button-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #1a1a1a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Checkmark khi đã gửi thành công */
.button-checkmark {
  font-size: 20px;
  font-weight: bold;
}

.button-text {
  font-size: 18px;
}

/* Modal thông báo thành công */
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  padding: 20px;
  box-sizing: border-box;
}

.success-modal {
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border-radius: 20px;
  padding: 30px 25px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(251, 207, 103, 0.3);
  animation: slideUp 0.4s ease;
  max-height: 90vh;
  overflow-y: auto;
}

.success-modal-content {
  text-align: center;
  color: #ffffff;
}

.success-icon {
  font-size: 60px;
  color: #fbcf67;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(251, 207, 103, 0.5);
}

.success-title {
  font-size: 24px;
  color: #fbcf67;
  margin-bottom: 15px;
  font-weight: bold;
  line-height: 1.3;
}

.success-message {
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 16px;
}

.reservation-details {
  background-color: rgba(255, 255, 255, 0.08);
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  text-align: left;
  border-left: 4px solid #fbcf67;
}

.details-title {
  margin-bottom: 15px;
  font-size: 16px;
  color: #fbcf67;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 0;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 24px;
}

.detail-text {
  font-size: 15px;
  line-height: 1.4;
}

.confirmation-message {
  margin-bottom: 25px;
  line-height: 1.6;
  font-size: 15px;
  opacity: 0.9;
}

.close-modal-button {
  background-color: #fbcf67;
  color: #1a1a1a;
  border: none;
  padding: 16px 40px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 200px;
}

.close-modal-button:hover {
  background-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(251, 207, 103, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Tablet Styles */
@media (min-width: 768px) {
  .reservation {
    padding: 100px 30px 60px;
  }
  
  .page-title {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  .description {
    font-size: 16px;
    margin-bottom: 40px;
  }
  
  .form-row {
    flex-direction: row;
    gap: 25px;
  }
  
  .success-modal {
    padding: 40px;
  }
  
  .success-title {
    font-size: 28px;
  }
  
  .close-modal-button {
    width: auto;
    padding: 12px 30px;
  }
}

/* Desktop Styles */
@media (min-width: 1024px) {
  .reservation {
    max-width: 800px;
    padding: 120px 40px 80px;
  }
  
  .form-title {
    font-size: 22px;
  }
  
  .reserve-button {
    padding: 20px 40px;
    font-size: 18px;
  }
}

/* Small Mobile Optimization */
@media (max-width: 360px) {
  .reservation {
    padding: 70px 12px 30px;
  }
  
  .page-title {
    font-size: 32px;
  }
  
  .description {
    font-size: 14px;
  }
  
  .form-input,
  .form-select,
  .form-textarea {
    padding: 12px 14px;
    font-size: 15px;
  }
  
  .reserve-button {
    padding: 16px 20px;
    font-size: 16px;
    min-height: 55px;
  }
  
  .success-modal {
    padding: 25px 20px;
    margin: 10px;
  }
  
  .success-title {
    font-size: 22px;
  }
  
  .success-icon {
    font-size: 50px;
  }
}

/* Landscape Mode for Mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .reservation {
    padding: 70px 15px 30px;
  }
  
  .page-title {
    font-size: 32px;
    margin-bottom: 12px;
  }
  
  .description {
    margin-bottom: 20px;
  }
  
  .form-section {
    margin-bottom: 20px;
  }
  
  .form-row {
    margin-bottom: 15px;
  }
  
  .reservation-note {
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .success-modal {
    max-height: 85vh;
    padding: 20px;
  }
}
</style>