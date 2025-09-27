<template>
    <div class="menu-page">
      <Header />
      <section class="menu">
        <!-- Bộ lọc, tìm kiếm và làm mới -->
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
            <span class="price">{{ formatPrice(item.price) }} VNĐ</span>
            <div v-if="mode === 'staff'" class="item-quantity">
              <p>Số lượng</p>
              <input type="number" v-model="item.quantity" min="0" required/>
            </div>
            <button v-if="mode === 'staff'" @click="addToCart(item)">
              <img src="../assets/images/plus-icon.svg" alt="Thêm vào giỏ hàng" />
            </button>
          </div>
        </div>
  
        <!-- Phân trang -->
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
    background-color: #1a1a1a;
    min-height: 100vh;
    color: #ffffff;
  }
  
  .menu {
    max-width: 100%;
    margin: 0 auto;
    /* text-align: center; */
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
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .filter-search .refresh-button {
    padding: 8px 16px;
    background-color: #fbcf67;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .filter-search .refresh-button:hover {
    background-color: #8e7a4e;
  }

  .menu .menu-card{
    background-color: #2a2a2a;
    padding: 20px 20px 10px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s;
  }

  .menu .category{
    margin-bottom: 20px;
  }
  
  .menu h2 {
    font-size: 24px;
    color: #fbcf67;
    margin: 40px 0 20px;
    text-align: left;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    text-align: left;
    gap: 20px;
  }

  
  .menu-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .item-details {
    flex: 1;
  }
  
  .item-details h3 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .item-details p {
    font-size: 14px;
    color: #e1e1e1;
    margin-bottom: 10px;
  }
  
  .price {
    font-size: 16px;
    color: #fbcf67;
  }
  .item-quantity{
    margin: 0 20px ;
    display: flex;
    flex-direction: column; 
    align-items: center;
    
  }

  .item-quantity p {
    font-size: 14px;
    color: #fffafa;
    margin-bottom: 5px;
    text-align: center;
  }

  .menu-item input{
    width: 50px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    /* margin: 10px 20px 30px 10px; */
    /* margin-right: 10px; */
    margin-bottom: 20px;
    text-align: center;
  }

  .menu-item button {
    background-color: #fbcf67;
    border: none;
    border-radius: 5px;
    padding: 5px;
    cursor: pointer;
  }
  
  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
  }
  
  .pagination button {
    padding: 8px 16px;
    background-color: #fbcf67;
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