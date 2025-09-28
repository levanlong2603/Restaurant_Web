<template>
  <div class="menu-page">
    <Header />
    <h2>Thực đơn nhà hàng</h2>
    <div class="filter-search">
      <select v-model="selectedCategory" @change="fetchMenu">
        <option value="">Tất cả danh mục</option>
        <option value="appetizer">Khai vị</option>
        <option value="main_dish">Món chính</option>
        <option value="side_dish">Món ăn kèm</option>
        <option value="regional_specialty">Đặc sản vùng miền</option>
        <option value="vegetarian">Món chay</option>
        <option value="dessert">Tráng miệng</option>
        <option value="beverage">Đồ uống</option>
      </select>
      <input v-model="searchQuery" @input="debouncedFetchMenu" placeholder="Tìm kiếm món..." />
      <button @click="fetchMenu" class="refresh-button">Làm mới</button>
    </div>

    <section class="menu">
      <div v-for="(item, index) in paginatedItems" :key="item.id" class="menu-card">
        <h3 v-if="shouldShowCategoryHeader(index)" class="category">
          {{ getCategoryName(item.category) }}
        </h3>
        <div class="menu-item">
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <!-- <p>{{ item.description }}</p> -->
          </div>
          <div class="item-detail2">
            <img :src="getImageUrl(item.image)" :alt="item.name" class="menu-image" />
            <div class="item-detail3">
              <div class="item-detail4">
                <span class="price">{{ formatPrice(item.price) }} VNĐ</span>
                <div class="item-quantity">
                  <p>Số lượng</p>
                  <input type="number" v-model="item.quantity" min="1" required />
                </div>
                <button @click="addToCart(item)" :disabled="!reservation || !reservation.id" class="add-to-cart">
                  <img src="../assets/images/plus-icon.svg" alt="Thêm vào giỏ hàng" />
                </button>
              </div>
              <div class="item-detail5">
                <img src="../assets/images/edit-icon.svg" alt="Ghi chú" @click="item.noteDisplay = !item.noteDisplay" />
                <input type="text" v-model="item.note" v-if="item.noteDisplay" placeholder="Ghi chú" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Trang trước</button>
        <span>Trang {{ currentPage }} / {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Trang sau</button>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script>
import axios from 'axios';
import debounce from 'lodash/debounce';

export default {
  name: 'MenuDetail',
  props: {
    reservation: {
      type: Object,
      default: () => ({}),
    },
    localCartItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      menuItems: [],
      selectedCategory: '',
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
      totalItems: 0,
      categoryOrder: [
        'appetizer',
        'main_dish',
        'side_dish',
        'regional_specialty',
        'vegetarian',
        'dessert',
        'beverage',
      ],
      categoryNames: {
        appetizer: 'Khai vị / Appetizers',
        main_dish: 'Món chính / Main Dishes',
        side_dish: 'Món ăn kèm / Side Dishes',
        regional_specialty: 'Đặc sản vùng miền / Regional Specialties',
        vegetarian: 'Món chay / Vegetarian Dishes',
        dessert: 'Tráng miệng / Desserts',
        beverage: 'Đồ uống / Beverages',
      },
      cartItems: [],
      defaultImage: 'https://res.cloudinary.com/drem0ihib/image/upload/v1746546155/Logo_uujqeu.png',
    };
  },
  computed: {
    sortedItems() {
      let items = this.menuItems.filter(item => !item.deleted);
      if (this.selectedCategory) {
        items = items.filter(item => item.category === this.selectedCategory);
      }
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        items = items.filter(
          item =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
      }
      return items.sort(
        (a, b) =>
          this.categoryOrder.indexOf(a.category) -
          this.categoryOrder.indexOf(b.category)
      );
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedItems.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.sortedItems.length / this.itemsPerPage);
    },
    featuredItems() {
      const items = [...this.menuItems].filter(item => !item.deleted);
      return items.sort(() => 0.5 - Math.random()).slice(0, 3);
    },
  },
  methods: {
    async fetchMenu() {
      try {
        const params = {
          limit: 1000,
        };
        if (this.selectedCategory) params.category = this.selectedCategory;
        if (this.searchQuery) params.search = this.searchQuery;

        const response = await axios.get('http://localhost:3000/menu', { params });
        this.menuItems = response.data.menuItems || [];
        this.menuItems.forEach(item => {
          item.quantity = 0;
          item.note = '';
          item.noteDisplay = false;
        });
        this.totalItems = this.sortedItems.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1;
      } catch (error) {
        console.error('Lỗi khi tải menu:', error);
      }
    },
    debouncedFetchMenu: debounce(function () {
      this.fetchMenu();
    }, 300),
    addToCart(item) {
      if (!this.reservation.id) {
        alert("Vui lòng chọn bàn trước khi thêm món vào giỏ hàng!");
        return;
      }
      const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
      if (item.quantity <= 0) {
        return;
      }

      if (existingItem) {
        existingItem.quantity += item.quantity;
        if (item.note) {
          existingItem.note = item.note;
        }
      } else {
        this.cartItems.push({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          note: item.note || '',
        });
      }

      item.quantity = 0;
      item.note = '';
      item.noteDisplay = false;

      this.$emit('update:cartItems', this.cartItems);
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    getImageUrl(imageName) {
      if (!imageName || typeof imageName !== 'string' || imageName.trim() === '') {
        return this.defaultImage;
      }
      return imageName;
    },
    // handleImageError(event) {
    //   event.target.src = this.defaultImage;
    // },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN').format(price);
    },
    getCategoryName(category) {
      return this.categoryNames[category] || '';
    },
    shouldShowCategoryHeader(index) {
      if (index === 0) return true;
      const currentItem = this.paginatedItems[index];
      const previousItem = this.paginatedItems[index - 1];
      return currentItem.category !== previousItem.category;
    },
  },
  created() {
    this.fetchMenu();
  },
  watch: {
    localCartItems(newValue) {
      this.cartItems = newValue;
    },
    cartItems(newValue) {
      this.$emit('update:cartItems', newValue);
    },
  },
};
</script>

<style scoped>
.menu-page {
  background: linear-gradient(180deg, #1a1a1a, #0f0f0f);
  padding: 20px 30px;
  border-radius: 20px;
  color: #ffffff;
  width: 100%;
  border: 2px solid #c9302c;
  box-shadow: 0 0 15px rgba(201, 48, 44, 0.3);
}

.menu {
  max-height: 70vh;
  overflow: auto;
  padding: 10px;
}

.filter-search {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  justify-content: center;
  outline: none;
  padding: 15px;
  background: rgba(42, 42, 42, 0.8);
  border-radius: 10px;
  border: 1px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.filter-search select,
.filter-search input {
  padding: 10px 15px;
  border: 2px solid #c9302c;
  border-radius: 8px;
  background-color: #2a2a2a;
  color: #ffffff;
  outline: none;
  font-size: 16px;
  transition: all 0.3s ease;
}

.filter-search select:focus,
.filter-search input:focus {
  border-color: #ffffff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.filter-search .refresh-button {
  padding: 10px 20px;
  background: linear-gradient(to right, #c9302c, #a71e2a);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  border: 1px solid #ffffff;
}

.filter-search .refresh-button:hover {
  background: linear-gradient(to right, #a71e2a, #8a1a1f);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(201, 48, 44, 0.4);
}

.menu h2 {
  color: #ffffff;
  margin-bottom: 20px;
  margin-top: 0;
  text-align: center;
  font-size: 32px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding: 10px;
  background: linear-gradient(to right, #c9302c, #a71e2a);
  border-radius: 10px;
  border: 2px solid #ffffff;
  margin-bottom: 30px;
}

/* Tiêu đề danh mục */
.category {
  color: #ffffff;
  font-size: 26px;
  margin: 30px 0 15px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 10px 20px;
  background: linear-gradient(to right, #c9302c, #a71e2a);
  border-radius: 8px;
  border: 2px solid #ffffff;
  display: inline-block;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  background: linear-gradient(145deg, #2a2a2a, #1f1f1f);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
  width: 95%;
  height: auto;
  min-height: 200px;
  border: 2px solid #c9302c;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, #c9302c, #ffffff, #c9302c);
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(201, 48, 44, 0.4);
  border-color: #ffffff;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 15px;
  max-width: 40%;
  text-align: center;
  border-right: 2px dashed #c9302c;
}

.item-details h3 {
  font-size: 22px;
  font-weight: bold;
  margin-right: 15px;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.item-details p {
  font-size: 16px;
  color: #d4d4d4;
  margin: 0;
  max-width: 70%;
  word-wrap: break-word;
}

.item-detail2 {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  justify-content: flex-end;
  padding-left: 15px;
}

.menu-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.menu-image:hover {
  transform: scale(1.05);
  border-color: #c9302c;
}

.item-detail3 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
  width: 280px;
}

.item-detail4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 10px;
  background: rgba(42, 42, 42, 0.7);
  border-radius: 8px;
  border: 1px solid #c9302c;
}

.item-detail4 .price {
  font-size: 18px;
  color: #ffffff;
  flex: 1;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(to right, #c9302c, #a71e2a);
  padding: 5px 10px;
  border-radius: 5px;
  text-align: center;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.item-quantity p {
  color: #ffffff;
  margin-bottom: 8px;
  margin-top: 0;
  text-align: center;
  font-weight: bold;
}

.item-quantity input {
  background-color: #1a1a1a;
  width: 60px;
  padding: 8px;
  border: 2px solid #c9302c;
  border-radius: 6px;
  text-align: center;
  color: #ffffff;
  outline: none;
  font-size: 16px;
  transition: all 0.3s ease;
}

.item-quantity input:focus {
  border-color: #ffffff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.add-to-cart {
  background: linear-gradient(to bottom, #c9302c, #a71e2a);
  border: 2px solid #ffffff;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  flex: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.add-to-cart:hover:not(:disabled) {
  background: linear-gradient(to bottom, #a71e2a, #8a1a1f);
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(201, 48, 44, 0.5);
}

.add-to-cart:disabled {
  background: #555;
  border-color: #777;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.item-detail5 {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 5px;
  background: rgba(42, 42, 42, 0.7);
  border-radius: 8px;
  border: 1px solid #c9302c;
}

.item-detail5 img {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 5px;
  border-radius: 5px;
  background: #2a2a2a;
}

.item-detail5 img:hover {
  background: #c9302c;
  transform: scale(1.1);
}

.item-detail5 input {
  background-color: #1a1a1a;
  padding: 8px;
  width: 200px;
  border: 2px solid #c9302c;
  border-radius: 6px;
  color: #ffffff;
  outline: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.item-detail5 input:focus {
  border-color: #ffffff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding: 15px;
  background: rgba(42, 42, 42, 0.8);
  border-radius: 10px;
  border: 1px solid #ffffff;
}

.pagination button {
  padding: 10px 20px;
  background: linear-gradient(to right, #c9302c, #a71e2a);
  color: white;
  border: 2px solid #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background: linear-gradient(to right, #a71e2a, #8a1a1f);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(201, 48, 44, 0.4);
}

.pagination button:disabled {
  background: #555;
  border-color: #777;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination span {
  font-size: 18px;
  line-height: 40px;
  color: #ffffff;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Custom scrollbar */
.menu::-webkit-scrollbar {
  width: 10px;
}

.menu::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 5px;
}

.menu::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #c9302c, #a71e2a);
  border-radius: 5px;
  border: 1px solid #ffffff;
}

.menu::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #a71e2a, #8a1a1f);
}
</style>