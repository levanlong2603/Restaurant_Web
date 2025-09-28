<template>
  <div class="floor-section">
    <div class="header">
      <h1>Quản lý bàn ăn</h1>
      <div class="restaurant-info">
        <span class="restaurant-name">Nhà hàng Tinh Hoa Việt</span>
        <span class="current-time">{{ currentTime }}</span>
      </div>
    </div>
    
    <div class="floors-container">
      <!-- Tầng 1 -->
      <div class="floor-card">
        <div class="floor-header">
          <h2>Tầng 1</h2>
          <div class="floor-stats">
            <span class="stat">
              <span class="stat-value">{{ getAvailableTables(floor1Tables) }}</span>
              <span class="stat-label">Trống</span>
            </span>
            <span class="stat">
              <span class="stat-value">{{ getOccupiedTables(floor1Tables) }}</span>
              <span class="stat-label">Đang phục vụ</span>
            </span>
            <span class="stat">
              <span class="stat-value">{{ getReservedTables(floor1Tables) }}</span>
              <span class="stat-label">Đặt trước</span>
            </span>
          </div>
        </div>
        
        <div class="table-grid floor-1">
          <div
            v-for="table in floor1Tables"
            :key="table.id"
            :class="[
              'table',
              table.seats === 2 ? 'table-2' : 'table-4',
              getStatusClass(table.status),
              newSelectedTables.includes(table.id) ? 'selected' : ''
            ]"
            @click="UpdateTable(table)"
          >
            <div class="table-number">{{ table.name }}</div>
            <div class="table-seats">{{ table.seats }} chỗ</div>
            <div v-if="table.status === 'reserved'" class="table-time">
              {{ table.reservationTime }}
            </div>
            <div v-if="table.status === 'serving'" class="table-time">
              {{ table.startTime }}
            </div>
            <div class="table-status-indicator"></div>
          </div>
        </div>
      </div>
      
      <!-- Tầng 2 -->
      <div class="floor-card">
        <div class="floor-header">
          <h2>Tầng 2</h2>
          <div class="floor-stats">
            <span class="stat">
              <span class="stat-value">{{ getAvailableTables(floor2Tables) }}</span>
              <span class="stat-label">Trống</span>
            </span>
            <span class="stat">
              <span class="stat-value">{{ getOccupiedTables(floor2Tables) }}</span>
              <span class="stat-label">Đang phục vụ</span>
            </span>
            <span class="stat">
              <span class="stat-value">{{ getReservedTables(floor2Tables) }}</span>
              <span class="stat-label">Đặt trước</span>
            </span>
          </div>
        </div>
        
        <div class="table-grid floor-2">
          <div
            v-for="table in floor2Tables"
            :key="table.id"
            :class="[
              'table',
              table.seats === 2 ? 'table-2' : 'table-4',
              getStatusClass(table.status),
              newSelectedTables.includes(table.id) ? 'selected' : ''
            ]"
            @click="UpdateTable(table)"
          >
            <div class="table-number">{{ table.name }}</div>
            <div class="table-seats">{{ table.seats }} chỗ</div>
            <div v-if="table.status === 'reserved'" class="table-time">
              {{ table.reservationTime }}
            </div>
            <div v-if="table.status === 'serving'" class="table-time">
              {{ table.startTime }}
            </div>
            <div class="table-status-indicator"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Legend -->
    <div class="legend-card">
      <h3>Chú thích trạng thái</h3>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-box available"></div>
          <span class="legend-label">Trống</span>
        </div>
        <div class="legend-item">
          <div class="legend-box serving"></div>
          <span class="legend-label">Đang phục vụ</span>
        </div>
        <div class="legend-item">
          <div class="legend-box reserved"></div>
          <span class="legend-label">Đặt trước</span>
        </div>
        <div class="legend-item">
          <div class="legend-box selected"></div>
          <span class="legend-label">Đã chọn</span>
        </div>
      </div>
    </div>
    
    <!-- Selected Tables Summary -->
    <div v-if="newSelectedTables.length > 0" class="selected-summary">
      <h3>Bàn đã chọn ({{ newSelectedTables.length }})</h3>
      <div class="selected-tables-list">
        <span v-for="tableId in newSelectedTables" :key="tableId" class="selected-table-tag">
          {{ getTableName(tableId) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableLayout',
  props: {
    tables: {
      type: Array,
      required: true,
    },
    selected_tables: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      newSelectedTables: [],
      updateTableStatus: [],
      currentTime: new Date().toLocaleTimeString('vi-VN'),
    };
  },
  computed: {
    floor1Tables() {
      return this.updateTableStatus.filter((table) => table.id <= 8);
    },
    floor2Tables() {
      return this.updateTableStatus.filter((table) => table.id > 8);
    },
  },
  methods: {
    getStatusClass(status) {
      return {
        available: status === 'available',
        reserved: status === 'booked',
        serving: status === 'occupied',
      };
    },
    UpdateTable(table) {
      let updatedSelected = [...this.newSelectedTables];
      let updatedTables = [...this.updateTableStatus];
      
      if (table.status === 'occupied' || table.status === 'booked') {
        return;
      }
      
      if (updatedSelected.includes(table.id)) {
        updatedSelected = updatedSelected.filter((id) => id !== table.id);
        updatedTables = updatedTables.map((item) =>
          item.id === table.id ? { ...item, status: 'available' } : item
        );
      } else {
        updatedSelected.push(table.id);
        updatedTables = updatedTables.map((item) =>
          item.id === table.id ? { ...item, status: 'booked' } : item
        );
      }

      this.newSelectedTables = updatedSelected;
      this.updateTableStatus = updatedTables;

      this.$emit('update:newSelectedTables', this.newSelectedTables);
      this.$emit('update:updateTableStatus', this.updateTableStatus);
    },
    getAvailableTables(tables) {
      return tables.filter(table => table.status === 'available').length;
    },
    getOccupiedTables(tables) {
      return tables.filter(table => table.status === 'occupied').length;
    },
    getReservedTables(tables) {
      return tables.filter(table => table.status === 'booked').length;
    },
    getTableName(tableId) {
      const table = this.updateTableStatus.find(t => t.id === tableId);
      return table ? table.name : '';
    },
    updateCurrentTime() {
      this.currentTime = new Date().toLocaleTimeString('vi-VN');
    }
  },
  watch: {
    selected_tables: {
      handler(newVal) {
        this.newSelectedTables = [...newVal];
      },
      immediate: true,
    },
    tables: {
      handler(newVal) {
        this.updateTableStatus = [...newVal];
      },
      immediate: true,
    },
  },
  mounted() {
    document.documentElement.style.backgroundColor = '#f8f8f8';
    // Cập nhật thời gian mỗi phút
    this.timeInterval = setInterval(this.updateCurrentTime, 60000);
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
};
</script>

<style scoped>
.floor-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #c62828;
}

.header h1 {
  margin: 0;
  font-size: 28px;
  color: #333333;
  font-weight: 700;
}

.restaurant-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.restaurant-name {
  font-size: 16px;
  color: #c62828;
  margin-bottom: 5px;
  font-weight: 600;
}

.current-time {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

.floors-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.floor-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e0e0e0;
}

.floor-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.floor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.floor-header h2 {
  margin: 0;
  font-size: 22px;
  color: #333333;
  font-weight: 600;
}

.floor-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #c62828;
}

.stat-label {
  font-size: 12px;
  color: #666666;
  margin-top: 2px;
}

.table-grid {
  display: grid;
  gap: 15px;
  padding: 10px;
}

.floor-1 {
  grid-template-columns: repeat(4, 1fr);
}

.floor-2 {
  grid-template-columns: repeat(4, 1fr);
}

.table {
  border-radius: 8px;
  text-align: center;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.table:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.table-2 {
  width: 70px;
}

.table-4 {
  width: 90px;
}

.available {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border: 2px solid #4caf50;
}

.serving {
  background: linear-gradient(135deg, #ff9800, #ef6c00);
  border: 2px solid #ff9800;
}

.reserved {
  background: linear-gradient(135deg, #c62828, #b71c1c);
  border: 2px solid #c62828;
}

.table-number {
  font-size: 16px;
  margin-bottom: 4px;
}

.table-seats {
  font-size: 11px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.table-time {
  font-size: 10px;
  opacity: 0.85;
  margin-top: 2px;
}

.table-status-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
}

.selected {
  border: 3px solid #c62828;
  box-shadow: 0 0 0 2px rgba(198, 40, 40, 0.3);
}

.legend-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
}

.legend-card h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333333;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.legend-items {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-box.available {
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border: 1px solid #4caf50;
}

.legend-box.serving {
  background: linear-gradient(135deg, #ff9800, #ef6c00);
  border: 1px solid #ff9800;
}

.legend-box.reserved {
  background: linear-gradient(135deg, #c62828, #b71c1c);
  border: 1px solid #c62828;
}

.legend-box.selected {
  background: white;
  border: 2px solid #c62828;
}

.legend-label {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

.selected-summary {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.selected-summary h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333333;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.selected-tables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-table-tag {
  background: #c62828;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 992px) {
  .floors-container {
    grid-template-columns: 1fr;
  }
  
  .floor-1, .floor-2 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .restaurant-info {
    align-items: flex-start;
    margin-top: 10px;
  }
  
  .floor-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .floor-stats {
    margin-top: 10px;
  }
  
  .floor-1, .floor-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .legend-items {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .floor-section {
    padding: 15px;
  }
  
  .floor-1, .floor-2 {
    grid-template-columns: 1fr;
  }
  
  .table {
    height: 70px;
  }
}
</style>