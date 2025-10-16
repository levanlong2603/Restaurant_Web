<template>
  <div class="floor-section">
    <div class="display1">
      <div class="floor1-section">
        <h2>Tầng 1</h2>
        <div class="table-grid floor-1">
          <div
            v-for="table in floor1Tables"
            :key="table.table_id"
            :class="[
              'table',
              table.seats === 2 ? 'table-2' : 'table-4',
              getStatusClass(table.status),
              newSelectedTables.includes(table.table_id) ? 'selected' : ''
            ]"
            @click="UpdateTable(table)"
          >
            {{ table.name }} <br />
            <small v-if="table.status === 'reserved'">{{ table.reservationTime }}</small>
            <small v-if="table.status === 'serving'">{{ table.startTime }}</small>
          </div>
        </div>
      </div>
      <div class="legend">
        <div class="legend-item"><div class="legend-box available"></div> Trống</div>
        <div class="legend-item"><div class="legend-box serving"></div> Đang phục vụ</div>
        <div class="legend-item"><div class="legend-box reserved"></div> Đặt trước</div>
      </div>
    </div>
    <div class="floor2-section">
      <h2>Tầng 2</h2>
      <div class="table-grid floor-2">
        <div
          v-for="table in floor2Tables"
          :key="table.table_id"
          :class="[
            'table',
            table.seats === 2 ? 'table-2' : 'table-4',
            getStatusClass(table.status),
            newSelectedTables.includes(table.table_id) ? 'selected' : ''
          ]"
          @click="UpdateTable(table)"
        >
          {{ table.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import router from '@/router';
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
    };
  },
  computed: {
    floor1Tables() {
      return this.updateTableStatus.filter((table) => table.table_id <= 8);
    },
    floor2Tables() {
      return this.updateTableStatus.filter((table) => table.table_id > 8);
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
      if (updatedSelected.includes(table.table_id)) {
        updatedSelected = updatedSelected.filter((id) => id !== table.table_id);
        updatedTables = updatedTables.map((item) =>
          item.table_id === table.table_id ? { ...item, status: 'available' } : item
        );
      } else {
        updatedSelected.push(table.table_id);
        updatedTables = updatedTables.map((item) =>
          item.table_id === table.table_id ? { ...item, status: 'booked' } : item
        );
      }

      this.newSelectedTables = updatedSelected;
      this.updateTableStatus = updatedTables;

      this.$emit('update:newSelectedTables', this.newSelectedTables);
      this.$emit('update:updateTableStatus', this.updateTableStatus);
    },
  },
  watch: {
    selected_tables: {
      handler(newVal) {
        this.newSelectedTables = [...newVal]; // Đồng bộ từ prop
        console.log('Update Selected tables from prop:', this.newSelectedTables);
      },
      immediate: true,
    },
    tables: {
      handler(newVal) {
        this.updateTableStatus = [...newVal]; // Đồng bộ từ prop
        console.log('Update Table Status from prop:', this.updateTableStatus);
      },
      immediate: true,
    },
  },
  mounted() {
    document.documentElement.style.backgroundColor = '#000';
  },
};
</script>

<style scoped>
.floor-section { 
  max-width: 800px; 
}

h2 { 
  margin: 0 0 10px; 
  font-size: 24px; 
  color: #FFF8E7; /* Trắng kem */
  text-align: center; 
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.floor1-container { 
  display: flex; 
  gap: 40px; 
  align-items: flex-start; 
  justify-content: center;
}

.display1{
  display: flex;
  gap: 40px;
  width: 100%;
  justify-content: center;
  align-items: flex-start;
}

.floor1-section{
  width: 80%;
  margin-bottom: 20px;
  position: relative;
  justify-content: center;
  align-items: center;
}

.table-grid { 
  padding: 25px; 
  background: linear-gradient(135deg, #8B5E3C, #6B4226); /* Nâu gỗ đến nâu đất */
  border-radius: 15px; 
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3); 
  border: 1px solid rgba(231, 194, 125, 0.4); /* Vàng nhạt */
  backdrop-filter: blur(10px);
}

.floor-1 { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  grid-template-rows: repeat(2, auto); 
  gap: 20px; 
  width: 90%;
  margin: 0 auto;
}

.floor-2 { 
  display: grid; 
  grid-template-columns: repeat(6, 1fr); 
  grid-template-rows: repeat(2, auto); 
  gap: 15px; 
  margin: 0 auto;
}

.table { 
  border-radius: 12px; 
  text-align: center; 
  padding: 15px 10px; 
  cursor: pointer; 
  transition: all 0.3s ease; 
  color: #3B2F2F; /* Đen nâu */
  font-weight: bold; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  height: 70px; 
  margin: 0 auto; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.table::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 248, 231, 0.3);
}

.table:hover { 
  transform: translateY(-5px) scale(1.02); 
  box-shadow: 0 8px 25px rgba(0,0,0,0.25); 
}

.table-2 { 
  width: 70px; 
  background: linear-gradient(135deg, #E7C27D, #D4AF37); /* Vàng nhạt */
}

.table-4 { 
  width: 110px; 
  background: linear-gradient(135deg, #E7C27D, #D4AF37); /* Vàng nhạt */
}

/* Trạng thái bàn */
.available { 
  background: linear-gradient(135deg, #E7C27D, #D4AF37); /* Vàng nhạt */
}

.serving { 
  background: linear-gradient(135deg, #FFB347, #FF9500); /* Cam - đang phục vụ */
  color: #FFF8E7; /* Trắng kem */
}

.reserved { 
  background: linear-gradient(135deg, #A0522D, #8B4513); /* Nâu đậm - đã đặt */
  color: #FFF8E7; /* Trắng kem */
}

.occupied {
  background: linear-gradient(135deg, #CD5C5C, #B22222); /* Đỏ - đang có khách */
  color: #FFF8E7; /* Trắng kem */
}

.table small { 
  font-size: 11px; 
  margin-top: 5px; 
  color: rgba(59, 47, 47, 0.8); 
  font-weight: 500;
}

.serving small, .reserved small, .occupied small {
  color: rgba(255, 248, 231, 0.9);
}

.selected {
  border: 3px solid #FFF8E7; /* Trắng kem */
  box-shadow: 0 0 0 3px #E7C27D, 0 8px 25px rgba(231, 194, 125, 0.4);
  transform: translateY(-3px);
}

.legend { 
  height: auto;
  min-height: 200px;
  width: 200px;
  display: flex;
  flex-direction: column;
  padding: 20px; 
  background: linear-gradient(135deg, #8B5E3C, #6B4226); /* Nâu gỗ đến nâu đất */
  border-radius: 15px; 
  justify-content: center;
  align-items: flex-start; 
  box-shadow: 0 8px 25px rgba(107, 66, 38, 0.3);
  border: 1px solid rgba(231, 194, 125, 0.4);
  gap: 12px;
  backdrop-filter: blur(10px);
}

.legend h3 {
  color: #FFF8E7; /* Trắng kem */
  margin: 0 0 10px 0;
  font-size: 18px;
  text-align: center;
  width: 100%;
  font-weight: bold;
}

.legend-item { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  font-size: 14px;
  color: #FFF8E7; /* Trắng kem */
  font-weight: 500;
  width: 100%;
}

.legend-box { 
  width: 22px; 
  height: 22px; 
  border-radius: 6px; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  flex-shrink: 0;
}

/* Màu cho legend */
.legend-available { 
  background: linear-gradient(135deg, #E7C27D, #D4AF37); 
}

.legend-serving { 
  background: linear-gradient(135deg, #FFB347, #FF9500); 
}

.legend-reserved { 
  background: linear-gradient(135deg, #A0522D, #8B4513); 
}

.legend-occupied { 
  background: linear-gradient(135deg, #CD5C5C, #B22222); 
}

/* Hiệu ứng pulse cho bàn đang phục vụ */
.serving {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3); }
  50% { box-shadow: 0 4px 20px rgba(255, 149, 0, 0.6); }
  100% { box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3); }
}

/* Responsive */
@media (max-width: 768px) {
  .floor1-container { 
    flex-direction: column;
    gap: 20px;
  }
  
  .display1 {
    flex-direction: column;
    gap: 20px;
  }
  
  .floor1-section {
    width: 100%;
  }
  
  .floor-1, .floor-2 {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
  
  .legend {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    height: auto;
    padding: 15px;
  }
  
  .legend h3 {
    width: 100%;
    margin-bottom: 15px;
  }
}
</style>