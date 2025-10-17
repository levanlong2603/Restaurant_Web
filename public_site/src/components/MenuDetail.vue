<template>
    <div class="menu-page">
      <Header />
      <section class="menu">
  <!-- Bộ lọc, tìm kiếm và làm mới -->
  <h2>{{ $t('menuTitle') || ( (this.$i18n && (this.$i18n.locale.value || this.$i18n.locale)) === 'en' ? 'Restaurant Menu' : 'Thực đơn nhà hàng' ) }}</h2>
        <div class="filter-search">
          <select v-model="selectedCategory" @change="fetchMenu">
            <option value="">{{ $t('allCategories') || (this.$i18n && (this.$i18n.locale.value || this.$i18n.locale)) === 'en' ? 'All categories' : 'Tất cả danh mục' }}</option>
            <option value="appetizer">{{ $t('category.appetizer') || 'Khai vị' }}</option>
            <option value="main_dish">{{ $t('category.main_dish') || 'Món chính' }}</option>
            <option value="side_dish">{{ $t('category.side_dish') || 'Món ăn kèm' }}</option>
            <option value="regional_specialty">{{ $t('category.regional_specialty') || 'Đặc sản vùng miền' }}</option>
            <option value="vegetarian">{{ $t('category.vegetarian') || 'Món chay' }}</option>
            <option value="dessert">{{ $t('category.dessert') || 'Tráng miệng' }}</option>
            <option value="beverage">{{ $t('category.beverage') || 'Đồ uống' }}</option>
          </select>
          <input v-model="searchQuery" @input="debouncedFetchMenu" :placeholder="$t('searchPlaceholder') || 'Tìm kiếm món...'" />
          <button @click="fetchMenu" class="refresh-button">{{ $t('refresh') || 'Làm mới' }}</button>
        </div>
  
        <!-- Danh sách món ăn phân trang -->
        <div v-for="(item, index) in paginatedItems" :key="item.id" class="menu-card">
          <!-- Hiển thị tiêu đề danh mục khi bắt đầu một danh mục mới -->
          <h3 v-if="shouldShowCategoryHeader(index)" class="category">
            {{ getCategoryName(item.category) }}
          </h3>
          <div class="menu-item">
            <img :src="getImageUrl(item.image)" :alt="item.name" class="menu-image" />
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <span class="price">{{ formatPrice(item.price) }} {{ (this.$i18n && (this.$i18n.locale.value || this.$i18n.locale)) === 'en' ? 'VND' : 'VNĐ' }}</span>
            <div v-if="mode === 'staff'" class="item-quantity">
              <p>{{ $t('quantity') || 'Số lượng' }}</p>
              <input type="number" v-model="item.quantity" min="0" required/>
            </div>
              <button v-if="mode === 'staff'" @click="addToCart(item)">
              <img src="../assets/images/plus-icon.svg" :alt="$t('addToCartAlt') || 'Thêm vào giỏ hàng'" />
            </button>
          </div>
        </div>
  
        <!-- Phân trang -->
        <div class="pagination" v-if="totalPages > 1">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">{{ $t('prevPage') || 'Trang trước' }}</button>
          <span>{{ $t('pageInfo') || 'Trang' }} {{ currentPage }} / {{ totalPages }}</span>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">{{ $t('nextPage') || 'Trang sau' }}</button>
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
      featuredItems() {
        const items = [...this.menuItems].filter(item => !item.deleted);
        return items.sort(() => 0.5 - Math.random()).slice(0, 3);
      },
    },
    methods: {
      async fetchMenu() {
        try {
          const params = {
            limit: 1000, // Lấy tất cả món ăn một lần
          };
          if (this.selectedCategory) params.category = this.selectedCategory;
          if (this.searchQuery) params.search = this.searchQuery;
  
          const response = await axios.get('http://localhost:3000/menu', { params });
          this.menuItems = response.data.menuItems || [];
          this.totalItems = this.sortedItems.length;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.currentPage = 1; // Reset về trang 1 khi lọc
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
}

/* Filter, Search, and Refresh */
.filter-search {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter-search select,
.filter-search input {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #fbcf67;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: #2b2b2b;
  outline: none;
  font-weight: 500;
}

.filter-search select option {
  background: #c2aa77;
  color: #2b2b2b;
}

.filter-search .refresh-button {
  padding: 10px 20px;
  background: #fbcf67;
  color: #2b2b2b;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-search .refresh-button:hover {
  background: #e5b756;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.menu .menu-card{
  background: rgba(255, 255, 255, 0.1);
  padding: 20px 20px 10px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  border: 1px solid rgba(251, 207, 103, 0.3);
}

.menu .menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.15);
}

.menu .category{
  margin-bottom: 20px;
}

.menu h2 {
  font-size: 24px;
  color: #2b2b2b;
  margin: 40px 0 20px;
  text-align: left;
  font-weight: bold;
  background: rgba(251, 207, 103, 0.3);
  padding: 15px;
  border-radius: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  text-align: left;
  gap: 20px;
  padding: 15px;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #fbcf67;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2b2b2b;
}

.item-details p {
  font-size: 14px;
  color: #2b2b2b;
  margin-bottom: 10px;
  opacity: 0.8;
}

.price {
  font-size: 16px;
  color: #2b2b2b;
  font-weight: bold;
}

.item-quantity{
  margin: 0 20px;
  display: flex;
  flex-direction: column; 
  align-items: center;
}

.item-quantity p {
  font-size: 14px;
  color: #2b2b2b;
  margin-bottom: 5px;
  text-align: center;
  font-weight: 500;
}

.menu-item input{
  width: 60px;
  padding: 10px;
  border: 1px solid #fbcf67;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.2);
  color: #2b2b2b;
  font-weight: 500;
  outline: none;
}

.menu-item button {
  background: #fbcf67;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: #2b2b2b;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.menu-item button:hover {
  background: #e5b756;
  transform: scale(1.05);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
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

.pagination button:hover:not(:disabled) {
  background: #e5b756;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.pagination button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
  transform: none;
}

.pagination span {
  font-size: 16px;
  line-height: 40px;
  color: #2b2b2b;
  font-weight: 500;
}
</style>