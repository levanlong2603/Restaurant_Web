<template>
  <div class="menu-page">
    <Header />
    <section class="menu">
      <!-- Bộ lọc, tìm kiếm và làm mới -->
      <h2 class="menu-title">{{ $t('menuTitle') || ((this.$i18n && (this.$i18n.locale.value || this.$i18n.locale)) === 'en' ? 'Restaurant Menu' : 'Thực đơn nhà hàng') }}</h2>
      
      <div class="filter-search">
        <div class="filter-group">
          <select v-model="selectedCategory" @change="fetchMenu" class="category-select">
            <option value="">{{ $t('allCategories') || (this.$i18n && (this.$i18n.locale.value || this.$i18n.locale)) === 'en' ? 'All categories' : 'Tất cả danh mục' }}</option>
            <option value="appetizer">{{ $t('category.appetizer') || 'Khai vị' }}</option>
            <option value="main_dish">{{ $t('category.main_dish') || 'Món chính' }}</option>
            <option value="side_dish">{{ $t('category.side_dish') || 'Món ăn kèm' }}</option>
            <option value="regional_specialty">{{ $t('category.regional_specialty') || 'Đặc sản vùng miền' }}</option>
            <option value="vegetarian">{{ $t('category.vegetarian') || 'Món chay' }}</option>
            <option value="dessert">{{ $t('category.dessert') || 'Tráng miệng' }}</option>
            <option value="beverage">{{ $t('category.beverage') || 'Đồ uống' }}</option>
          </select>
        </div>
        
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            @input="debouncedFetchMenu" 
            :placeholder="$t('searchPlaceholder') || 'Tìm kiếm món...'" 
            class="search-input"
          />
        </div>
        
        <button @click="fetchMenu" class="refresh-button">
          <span class="refresh-text">{{ $t('refresh') || 'Làm mới' }}</span>
          <span class="refresh-icon">↻</span>
        </button>
      </div>

      <!-- Danh sách món ăn phân trang -->
      <div class="menu-items-container">
        <div v-for="(item, index) in paginatedItems" :key="item.id" class="menu-card">
          <!-- Hiển thị tiêu đề danh mục khi bắt đầu một danh mục mới -->
          <h3 v-if="shouldShowCategoryHeader(index)" class="category-header">
            {{ getCategoryName(item.category) }}
          </h3>
          <div class="menu-item">
            <div class="item-image-container">
              <img :src="getImageUrl(item.image)" :alt="item.name" class="menu-image" />
            </div>
            <div class="item-content">
              <div class="item-details">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                <div class="item-price">{{ formatPrice(item.price) }} {{ (this.$i18n && (this.$i18n.locale.value || this.$i18n.locale)) === 'en' ? 'VND' : 'VNĐ' }}</div>
              </div>
              
              <div v-if="mode === 'staff'" class="staff-controls">
                <div class="item-quantity">
                  <label class="quantity-label">{{ $t('quantity') || 'Số lượng' }}</label>
                  <input 
                    type="number" 
                    v-model="item.quantity" 
                    min="0" 
                    class="quantity-input"
                    required
                  />
                </div>
                <button @click="addToCart(item)" class="add-to-cart-btn">
                  <img src="../assets/images/plus-icon.svg" :alt="$t('addToCartAlt') || 'Thêm vào giỏ hàng'" class="plus-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hiển thị khi không có kết quả -->
      <div v-if="paginatedItems.length === 0" class="no-results">
        <p>{{ $t('noResults') || 'Không tìm thấy món ăn phù hợp' }}</p>
      </div>

      <!-- Phân trang -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="changePage(currentPage - 1)" 
          :disabled="currentPage === 1" 
          class="pagination-btn prev"
        >
          {{ $t('prevPage') || 'Trang trước' }}
        </button>
        <span class="page-info">{{ $t('pageInfo') || 'Trang' }} {{ currentPage }} / {{ totalPages }}</span>
        <button 
          @click="changePage(currentPage + 1)" 
          :disabled="currentPage === totalPages" 
          class="pagination-btn next"
        >
          {{ $t('nextPage') || 'Trang sau' }}
        </button>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script>
import axios from 'axios';
import debounce from 'lodash/debounce';

export default {
  name: 'Menu',
  props: {
    mode: {
      type: String,
      default: 'customer',
    },
  },
  data() {
    return {
      menuItems: [],
      selectedCategory: '',
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 8, // Giảm số lượng item mỗi trang cho mobile
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
      // Sắp xếp theo thứ tự danh mục
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
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        // Cuộn lên đầu trang khi chuyển trang
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    getImageUrl(imageName) {
      return imageName ? `http://localhost:3000${imageName}` : '/default-image.jpg';
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
    addToCart(item) {
      // Logic thêm vào giỏ hàng
      console.log('Thêm vào giỏ hàng:', item);
    }
  },
  async created() {
    await this.fetchMenu();
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
  max-width: 100%;
  margin: 0 auto;
  padding: 0 15px;
}

.menu-title {
  font-size: 24px;
  color: #2b2b2b;
  margin: 20px 0;
  text-align: center;
  font-weight: bold;
  background: rgba(251, 207, 103, 0.3);
  padding: 15px;
  border-radius: 8px;
}

/* Filter, Search, and Refresh - Mobile Optimized */
.filter-search {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-group,
.search-group {
  width: 100%;
}

.category-select,
.search-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border: 1px solid #fbcf67;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: #2b2b2b;
  outline: none;
  font-weight: 500;
  box-sizing: border-box;
}

.category-select option {
  background: #c2aa77;
  color: #2b2b2b;
}

.refresh-button {
  width: 100%;
  padding: 12px 20px;
  background: #fbcf67;
  color: #2b2b2b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.refresh-button:hover {
  background: #e5b756;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.refresh-icon {
  font-size: 18px;
}

/* Menu Items */
.menu-items-container {
  margin-bottom: 20px;
}

.menu-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.15);
}

.category-header {
  font-size: 18px;
  color: #2b2b2b;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #fbcf67;
  text-align: center;
  font-weight: bold;
}

.menu-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.item-image-container {
  flex-shrink: 0;
}

.menu-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #fbcf67;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #2b2b2b;
  line-height: 1.3;
}

.item-description {
  font-size: 14px;
  color: #2b2b2b;
  margin-bottom: 8px;
  opacity: 0.8;
  line-height: 1.4;
}

.item-price {
  font-size: 16px;
  color: #2b2b2b;
  font-weight: bold;
}

/* Staff Controls */
.staff-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.quantity-label {
  font-size: 12px;
  color: #2b2b2b;
  font-weight: 500;
}

.quantity-input {
  width: 60px;
  padding: 8px;
  border: 1px solid #fbcf67;
  border-radius: 6px;
  text-align: center;
  background: rgba(255, 255, 255, 0.2);
  color: #2b2b2b;
  font-weight: 500;
  outline: none;
  font-size: 14px;
}

.add-to-cart-btn {
  background: #fbcf67;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  color: #2b2b2b;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.add-to-cart-btn:hover {
  background: #e5b756;
  transform: scale(1.05);
}

.plus-icon {
  width: 20px;
  height: 20px;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #2b2b2b;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin: 20px 0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 30px 0 20px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 12px 20px;
  background: #fbcf67;
  color: #2b2b2b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-size: 14px;
  min-width: 120px;
}

.pagination-btn:hover:not(:disabled) {
  background: #e5b756;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.pagination-btn:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  font-size: 14px;
  color: #2b2b2b;
  font-weight: 500;
  padding: 0 10px;
}

/* Tablet Styles */
@media (min-width: 768px) {
  .menu {
    padding: 0 30px;
  }
  
  .filter-search {
    flex-direction: row;
    align-items: center;
  }
  
  .filter-group {
    flex: 1;
  }
  
  .search-group {
    flex: 2;
  }
  
  .refresh-button {
    width: auto;
    flex: 0 0 auto;
  }
  
  .menu-item {
    align-items: center;
  }
  
  .item-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  
  .staff-controls {
    margin-top: 0;
    flex-shrink: 0;
  }
  
  .pagination-btn {
    min-width: 140px;
  }
}

/* Desktop Styles */
@media (min-width: 1024px) {
  .menu {
    max-width: 1200px;
    padding: 0 40px;
  }
  
  .menu-title {
    font-size: 28px;
    margin: 40px 0 30px;
  }
  
  .filter-search {
    gap: 30px;
    margin-bottom: 30px;
  }
  
  .category-select,
  .search-input {
    padding: 15px 20px;
    font-size: 16px;
  }
  
  .refresh-button {
    padding: 15px 25px;
  }
  
  .menu-card {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .menu-image {
    width: 100px;
    height: 100px;
  }
  
  .item-name {
    font-size: 18px;
  }
  
  .pagination-btn {
    padding: 15px 25px;
    font-size: 16px;
  }
  
  .page-info {
    font-size: 16px;
  }
}

/* Small Mobile Optimization */
@media (max-width: 360px) {
  .menu {
    padding: 0 10px;
  }
  
  .menu-title {
    font-size: 20px;
    padding: 12px;
    margin: 15px 0;
  }
  
  .menu-item {
    gap: 12px;
  }
  
  .menu-image {
    width: 70px;
    height: 70px;
  }
  
  .item-name {
    font-size: 15px;
  }
  
  .item-description {
    font-size: 13px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
  }
  
  .pagination-btn {
    width: 100%;
    min-width: auto;
  }
}

/* Landscape Mode for Mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .menu-page {
    min-height: auto;
  }
  
  .menu-title {
    margin: 15px 0;
    padding: 10px 15px;
  }
  
  .filter-search {
    margin-bottom: 15px;
  }
  
  .menu-card {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .menu-image {
    width: 60px;
    height: 60px;
  }
}
</style>