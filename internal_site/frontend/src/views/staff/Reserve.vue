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
      isSidebarCollapsed: false,
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
      const reservation = this.reservations.find(res => res.reservation_id === reservation_id);
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
  background: #FFF8E7;
  min-height: 100vh;
}

.reservation-management {
  flex: 1;
  margin: 0;
  padding: 0;
  background-color: #FFF8E7;
  color: #3B2F2F;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-right: 20px;
  transition: all 0.3s ease;
  margin-top: 60px;
  margin-left: 250px; /* Để sidebar có đủ không gian */
}

.reservation-management.sidebar-collapsed {
  margin-left: 70px; /* Khi sidebar thu gọn */
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
  width: 100%;
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

/* Responsive design */
@media (max-width: 768px) {
  .reservation-management {
    margin-left: 0 !important; /* Trên mobile, sidebar thường sẽ ẩn hoặc chiếm toàn bộ chiều rộng */
    margin-top: 50px;
    padding-right: 10px;
  }
  
  .container {
    margin: 20px 10px;
  }
  
  .floor1-container {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }
  
  .reservation-list {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    margin: 15px 5px;
  }
  
  .floor1-container {
    gap: 15px;
  }
  
  .reservation-management {
    padding-right: 10px;
    margin-top: 45px;
  }
}
</style>