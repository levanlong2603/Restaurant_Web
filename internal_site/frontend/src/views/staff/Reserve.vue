<template>
  <div class="main-container">
    <Navigation @sidebar-toggle="handleSidebarToggle" />
    <div class="reservation-management" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="container">
        <div class="floor1-container">
          <div class="search-bar">
            <ReservationForm @update:tables="updateTables" @update:reservations="updateReservations"
              @update:mode="updateMode" :reservation_id="reservation_id" :selected_tables="selected_tables" />
          </div>
          <div v-if="mode === 'reservation'" class="reservation-list">
            <ReservationBox :reservations="reservations" @update:mode="updateMode"
              @update:reservation_id="updateReservationID" />
          </div>
          <div v-else-if="mode === 'table'" class="table-layout">
            <Table :tables="tables" :selected_tables="selected_tables"
              @update:newSelectedTables="updateNewSelectedTables" @update:updateTableStatus="updateTableStatus" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReservationBox from '../../components/ReservationBox.vue';
import ReservationForm from '../../components/ReservationForm.vue';
import Table from '../../components/Table.vue';
// import Manager from '../admin/Manager.vue';
import Navigation from '../../components/Navigation.vue';

export default {
  name: 'Reserve',
  components: {
    ReservationForm,
    Table,
    ReservationBox,
    Navigation,
  },
  data() {
    return {
      tables: [],
      reservations: [],
      mode: 'table',
      reservation_id: null,
      selected_tables: [],
      newSelectedTables: [],
      updateTableStatus: [],
      isSidebarCollapsed: false, // Khởi tạo giá trị mặc định
    };
  },
  methods: {
    handleSidebarToggle(isCollapsed) {
      console.log('Sidebar is collapsed:', isCollapsed);
      this.isSidebarCollapsed = isCollapsed;
    },
    updateTables(tables) {
      this.tables = tables;
    },
    updateReservations(reservations) {
      this.reservations = reservations;
    },
    updateMode(mode) {
      this.mode = mode;
    },
    updateReservationID(reservation_id) {
      this.reservation_id = reservation_id;
      const reservation = this.reservations.find(res => res.id === reservation_id);
      this.selected_tables = reservation ? reservation.tables : [];
    },
    updateNewSelectedTables(newSelectedTables) {
      this.selected_tables = [...newSelectedTables];
    },
    updateTableStatus(updateTableStatus) {
      this.tables = [...updateTableStatus];
    },
  },
  mounted() {
    document.documentElement.style.backgroundColor = '#000';
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  background: #1a1a1a;
}

.reservation-management {
  flex: 1;
  margin: 0;
  padding: 0;
  background-color: #1a1a1a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-right: 20px;
  transition: margin-left 0.3s ease;
}

.reservation-management.sidebar-collapsed {
  margin-left: 10px;
}

.container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 40px 20px;
}

.floor1-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.table-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 20px;
}

.reservation-list {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70%;
}
</style>