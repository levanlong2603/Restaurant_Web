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
  background: linear-gradient(180deg, #2b2b2b, #1f2020);
  padding: 20px 30px;
  border-radius: 20px;
  color: #ffffff;
  width: 100%;
}

.menu {
  max-height: 70vh;
  overflow: auto;
}

.filter-search {
  display: flex;
  gap: 30px;
  margin-bottom: 10px;
  justify-content: center;
  outline: none;
}

.filter-search select,
.filter-search input {
  padding: 5px;
  border: 1px solid #464646;
  border-radius: 4px;
  background-color: #c2aa77;
  color: #ffffff;
  outline: none;
}

.filter-search .refresh-button {
  padding: 8px 16px;
  background-color: #ae9a64;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-search .refresh-button:hover {
  background-color: #8e7a4e;
}

.menu h2 {
  color: #ae9a64;
  margin-bottom: 10px;
  margin-top: 0;
  text-align: center;
}

/* Tiêu đề danh mục */
.category {
  color: #ae9a64;
  font-size: 24px;
  margin: 20px 0 10px;
  text-align: center;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  width: 95%;
  height: auto;
  min-height: 180px;
}

.menu-item:hover {
  transform: scale(1.02);
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: row;
  /* Thay đổi từ column sang row để hiển thị ngang */
  justify-content: center;
  /* Căn giữa theo chiều ngang */
  align-items: center;
  /* Căn giữa theo chiều dọc */
  padding: 0 10px;
  max-width: 40%;
  text-align: center;
}

.item-details h3 {
  font-size: 18px;
  font-weight: bold;
  margin-right: 10px;
  /* Khoảng cách giữa tên và mô tả */
}

.item-details p {
  font-size: 14px;
  color: #bcbcbc;
  margin: 0;
  /* Loại bỏ margin để căn chỉnh tốt hơn */
  max-width: 70%;
  /* Giới hạn chiều rộng mô tả để tránh tràn */
  word-wrap: break-word;
  /* Chuyển dòng nếu mô tả quá dài */
}

.item-detail2 {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  justify-content: flex-end;
}

.menu-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.item-detail3 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  width: 250px;
}

.item-detail4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.item-detail4 .price {
  font-size: 16px;
  color: #ae9a64;
  flex: 1;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.item-quantity p {
  color: #fffafa;
  margin-bottom: 8px;
  margin-top: 0;
  text-align: center;
}

.item-quantity input {
  background-color: #2a2a2a;
  width: 50px;
  padding: 8px;
  border: 1px solid #6c6c6c;
  border-radius: 4px;
  text-align: center;
  color: #ffffff;
  outline: none;
}

.add-to-cart {
  background-color: #ae9a64;
  border: none;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
  flex: 0;
}

.add-to-cart:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.item-detail5 {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 30px;
}

.item-detail5 img {
  cursor: pointer;
}

.item-detail5 input {
  background-color: #2a2a2a;
  padding: 5px;
  width: 180px;
  border: 1px solid #6c6c6c;
  border-radius: 4px;
  color: #ffffff;
  outline: none;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  background-color: #ae9a64;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  font-size: 16px;
  line-height: 40px;
}
</style>