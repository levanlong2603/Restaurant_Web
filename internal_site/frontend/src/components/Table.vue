<template>
  <div class="floor-section">
    <div class="display1">
      <div class="floor1-section">
        <h2>Tầng 1</h2>
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
          :key="table.id"
          :class="[
            'table',
            table.seats === 2 ? 'table-2' : 'table-4',
            getStatusClass(table.status),
            newSelectedTables.includes(table.id) ? 'selected' : ''
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
  color: #fff; 
  text-align: center; 
}

.floor1-container { 
  display: flex; 
  gap: 40px; 
  align-items: flex-start; 
}

.display1{
  display: flex;
  gap: 40px;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.floor1-section{
  width: 80%;
  margin-bottom: 20px;
  position: relative;
  justify-content: center;
  align-items: center;
}

.table-grid { 
  padding: 20px; 
  background: #333; 
  border-radius: 10px; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.3); 
}
.floor-1 { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  grid-template-rows: repeat(2, auto); 
  gap: 15px; 
  width: 90%;

}
.floor-2 { 
  display: grid; 
  grid-template-columns: repeat(6, 1fr); 
  grid-template-rows: repeat(2, auto); 
  gap: 15px; 
}
.table { 
  border-radius: 8px; 
  text-align: center; 
  padding: 15px; 
  cursor: pointer; 
  transition: transform 0.2s, box-shadow 0.2s; 
  color: #fff; 
  font-weight: bold; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  height: 60px; 
  margin: 0 auto; 
}
.table:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(0,0,0,0.4); }
.table-2 { width: 60px; }
.table-4 { width: 100px; }
.available { background: linear-gradient(135deg, #28a745, #218838); }
.serving { background: linear-gradient(135deg, #ffc107, #e0a800); }
.reserved { background: linear-gradient(135deg, #fd7e14, #e06b00); }
.table small { 
  font-size: 12px; 
  margin-top: 5px; 
  color: rgba(255,255,255,0.9); 
}

.selected {
  border: 3px solid white;
}

.legend { 
  height: 200px;
  width: 200px;
  display: grid;
  padding: 15px; 
  background: #333; 
  border-radius: 10px; 
  justify-content: center;
  align-items: center; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.3); 
  
}
.legend-item { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 14px;
  color: #fff;
}
.legend-box { 
  width: 20px; 
  height: 20px; 
  border-radius: 4px; }
</style>