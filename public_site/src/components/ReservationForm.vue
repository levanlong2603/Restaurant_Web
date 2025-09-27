<template>
  <section class="reservation-cta">
    <h2>ĐẶT BÀN VỚI CHÚNG TÔI</h2>
    <p>Bạn đã sẵn sàng trải nghiệm tinh hoa ẩm thực Việt Nam? <br>Hãy đặt bàn ngay tại "Tinh Hoa Việt"!</p>
    <form @submit.prevent="submitReservation">
      <input type="text" v-model="form.name" placeholder="Tên của bạn" required />
      <input type="tel" v-model="form.phoneNumber" placeholder="Số điện thoại" required />
      <input type="date" v-model="form.date" required />
      <input type="time" v-model="form.time" required />
      <input
        type="number"
        v-model.number="form.num_people"
        placeholder="Số lượng khách"
        min="1"
        required
      />
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'ĐANG GỬI...' : 'ĐẶT BÀN NGAY' }}
      </button>
    </form>
  </section>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ReservationForm',
  data() {
    return {
      form: {
        name: '',
        phoneNumber: '',
        num_people: 2,
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        tables: [] // Mảng này dùng nếu có chọn bàn
      },
      isSubmitting: false,
    };
  },
  methods: {
    async submitReservation() {
      this.isSubmitting = true;

      const reservation_time = `${this.form.date}T${this.form.time}`;

      const payload = {
        name: this.form.name,
        phoneNumber: this.form.phoneNumber,
        reservation_time,
        num_people: this.form.num_people,
        tables: this.form.tables
      };

      try {
        const { data } = await axios.post(
          'http://localhost:3000/reservation',
          payload
        );
        alert(data.message || 'Đặt bàn thành công!');
        this.resetForm();
      } catch (err) {
        const msg = err.response?.data?.message || 'Đặt bàn thất bại!';
        alert(msg);
        console.error('Lỗi khi gửi reservation:', err);
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.form = {
        name: '',
        phoneNumber: '',
        num_people: 2,
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        tables: []
      };
    }
  }
};
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 0 auto;
}
input {
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid white;
  border-radius: 5px;
  background: transparent;
  color: white;
}
.reservation-cta {
    background-color: #ae9a64;
    padding: 60px 20px;
    text-align: center;
    color: white;
}

.reservation-cta h2 {
    font-size: 48px;
    margin-bottom: 20px;
}

.reservation-cta p {
    font-size: 18px;
    margin-bottom: 30px;
}

.reservation-cta button {
    background-color: transparent;
    border: 2px solid white;
    color: white;
    padding: 15px 30px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

.reservation-cta button:hover {
    background-color: white;
    color: #ae9a64;
}

</style>