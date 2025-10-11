<template>
  <div class="menu-page">
    <Header />
    <section class="menu">
      <h1>MENU LONG QUÂN AN</h1>
      <p class="description">
        Menu nhà hàng mang đến hương vị đậm đà, hòa quyện giữa truyền thống và tinh tế. <br>Mỗi món ăn đều được chế biến
        tỉ mỉ, giữ trọn tinh hoa ẩm thực Việt.
      </p>

      <!-- Món ăn nổi bật (Slide tự động) -->
      <section class="featured-dishes">
        <h2>Món ăn nổi bật</h2>
        <carousel :items-to-show="1" :wrap-around="true" :autoplay="5000" :transition="500">
          <slide v-for="item in featuredItems" :key="item.id">
            <div class="featured-item">
              <img :src="getImageUrl(item.image)" :alt="item.name" class="featured-image" @error="handleImageError" />
              <div class="featured-details">
                <h3>{{ item.name }}</h3>
                <p>{{ item.description }}</p>
                <span class="price">{{ formatPrice(item.price) }} VNĐ</span>
              </div>
            </div>
          </slide>
          <template #addons>
            <navigation />
            <pagination />
          </template>
        </carousel>
      </section>

      <!-- Thực đơn nhà hàng -->
      <section class="menu-items-section">
        <div class="filter-section">
          <select v-model="selectedCategory" @change="fetchMenu" class="category-select">
            <option value="">Tất cả danh mục</option>
            <option v-for="cat in categoryOrder" :key="cat" :value="cat">{{ getCategoryName(cat) }}</option>
          </select>
          <input v-model="searchQuery" @input="debouncedFetchMenu" placeholder="Tìm kiếm món..." class="search-input" />
          <button @click="refresh" class="refresh-button">Làm mới</button>
        </div>

        <div v-if="paginatedItems.length" class="menu-items">
          <div v-for="(item, index) in paginatedItems" :key="item.id" class="menu-item">
            <div v-if="shouldShowCategoryHeader(index)" class="category-header">
              {{ getCategoryName(item.category) }}
            </div>
            <div class="menu-item-content">
              <img :src="getImageUrl(item.image)" :alt="item.name" class="menu-item-image" @error="handleImageError" />
              <div class="menu-item-details">
                <h3>{{ item.name }}</h3>
                <p>{{ item.description }}</p>
                <span class="price">{{ formatPrice(item.price) }} VNĐ</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-items">Không có món ăn nào để hiển thị.</div>

        <div class="pagination" v-if="totalPages > 1">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Trước</button>
          <span>Trang {{ currentPage }} / {{ totalPages }}</span>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Sau</button>
        </div>
      </section>
    </section>
    <Footer />
    <Chatbot />
  </div>
</template>

<script>
import axios from 'axios';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';
import debounce from 'lodash/debounce';
import 'vue3-carousel/dist/carousel.css';
import Chatbot from '@/components/Chatbot.vue';

export default {
  name: 'Menu',
  components: {
    Header,
    Footer,
    Carousel,
    Slide,
    Pagination,
    Navigation,
    Chatbot
  },
  data() {
    return {
      menuItems: [],
      featuredItems: [],
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
        console.log('Menu Items:', this.menuItems); // Debug

        this.totalItems = this.sortedItems.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1;
      } catch (error) {
        console.error('Lỗi khi tải menu:', error);
        this.menuItems = [];
      }
    },
    async fetchFeaturedDishes() {
      try {
        const response = await axios.get('http://localhost:3000/dashboard/dishes');
        const topDishes = response.data.current.topDishes || [];
        this.featuredItems = topDishes.map((dish, index) => ({
          id: `featured-${index}`,
          name: dish.name || dish.dishName || 'Tên không xác định', // Fallback nếu name thiếu
          description: dish.description || 'Chưa có mô tả',
          price: dish.price || 0,
          image: dish.image || '',
        }));
        console.log('Featured Items:', this.featuredItems); // Debug
      } catch (error) {
        console.error('Lỗi khi tải món ăn nổi bật:', error);
        this.featuredItems = [];
      }
    },
    debouncedFetchMenu: debounce(function () {
      this.fetchMenu();
    }, 300),
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    refresh() {
      this.selectedCategory = '';
      this.searchQuery = '';
      this.currentPage = 1;
      this.fetchMenu();
    },
    getImageUrl(imageName) {
      if (!imageName || typeof imageName !== 'string' || imageName.trim() === '') {
        return this.defaultImage;
      }
      return imageName;
    },
    handleImageError(event) {
      event.target.src = this.defaultImage;
    },
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
  async created() {
    console.log('Fetching menu and featured dishes...');
    await Promise.all([
      this.fetchMenu(),
      this.fetchFeaturedDishes(),
    ]);
    console.log('Featured Items after fetch:', this.featuredItems);
  },
};
</script>

<style scoped>
.menu-page {
  background-color: #c2aa77;
  min-height: 100vh;
  color: #2b2b2b;
}

.menu {
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 20px;
  text-align: center;
}

.menu h1 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2b2b2b;
  text-shadow: 0 0 5px #fbcf67, 0 0 30px #fbcf67;
}

.menu .description {
  font-size: 16px;
  color: #2b2b2b;
  margin-bottom: 40px;
  font-weight: 500;
}

/* Featured Dishes (Slide) */
.featured-dishes {
  margin-bottom: 40px;
}

.featured-dishes h2 {
  font-size: 24px;
  color: #2b2b2b;
  margin-bottom: 20px;
  text-align: left;
  font-weight: bold;
}

.carousel {
  width: 100%;
  height: 200px;
}

.featured-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.15);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(251, 207, 103, 0.3);
  backdrop-filter: blur(10px);
}

.featured-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #fbcf67;
}

.featured-details {
  flex: 1;
  text-align: left;
}

.featured-details h3 {
  display: block;
  font-size: 18px;
  color: #2b2b2b;
  margin-bottom: 10px;
  font-weight: bold;
}

.featured-details p {
  font-size: 14px;
  color: #2b2b2b;
  margin-bottom: 10px;
  opacity: 0.8;
}

.featured-details .price {
  font-size: 16px;
  color: #2b2b2b;
  font-weight: bold;
}

.carousel__prev,
.carousel__next {
  color: #2b2b2b;
  background: #fbcf67;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.carousel__pagination-button--active {
  background: #fbcf67;
}

/* Thực đơn nhà hàng */
.menu-items-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(251, 207, 103, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.filter-section {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.category-select,
.search-input {
  padding: 10px;
  border: 1px solid #fbcf67;
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  color: #2b2b2b;
  outline: none;
  font-weight: 500;
}

.category-select option {
  background: #c2aa77;
  color: #2b2b2b;
}

.refresh-button {
  padding: 10px 20px;
  background: #fbcf67;
  color: #2b2b2b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.refresh-button:hover {
  background: #e5b756;
  transform: translateY(-2px);
}

.menu-items {
  margin-bottom: 20px;
}

.category-header {
  font-size: 24px;
  color: #2b2b2b;
  margin: 20px 0 10px;
  text-align: center;
  font-weight: bold;
  background: rgba(251, 207, 103, 0.3);
  padding: 15px;
  border-radius: 8px;
}

.menu-item {
  margin-bottom: 15px;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(251, 207, 103, 0.3);
  transition: all 0.3s ease;
}

.menu-item-content:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.menu-item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #fbcf67;
}

.menu-item-details {
  flex: 1;
  text-align: left;
}

.menu-item-details h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #2b2b2b;
}

.menu-item-details p {
  font-size: 14px;
  color: #2b2b2b;
  margin-bottom: 5px;
  opacity: 0.8;
}

.price {
  font-size: 16px;
  color: #2b2b2b;
  font-weight: bold;
}

.no-items {
  text-align: center;
  color: #2b2b2b;
  font-size: 16px;
  font-weight: 500;
  padding: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  background: #fbcf67;
  color: #2b2b2b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pagination button:hover:not(:disabled) {
  background: #e5b756;
  transform: translateY(-2px);
}

.pagination button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
  transform: none;
}

.pagination span {
  color: #2b2b2b;
  font-weight: 500;
  line-height: 40px;
}
</style>