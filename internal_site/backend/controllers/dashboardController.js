const { Op } = require("sequelize");
const { Bill, Sequelize, Reservation, OrderItem, Menu, Customer} = require("../models");

// Helper function to get date range with validation
const getDateRange = (month, year, startDate, endDate) => {
  let currentStart, currentEnd, previousStart, previousEnd;

  try {
    if (startDate && endDate) {
      currentStart = new Date(startDate);
      currentEnd = new Date(endDate);
      if (isNaN(currentStart) || isNaN(currentEnd)) {
        throw new Error("Invalid startDate or endDate format");
      }
      const timeDiff = currentEnd - currentStart;
      if (timeDiff < 0) {
        throw new Error("endDate must be after startDate");
      }
      previousEnd = new Date(currentStart.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - timeDiff);
    } else {
      const currentDate = new Date();
      const currentYear = year ? parseInt(year) : currentDate.getFullYear();
      const currentMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
      if (isNaN(currentYear) || isNaN(currentMonth)) {
        throw new Error("Invalid month or year format");
      }
      currentStart = new Date(currentYear, currentMonth, 1);
      currentEnd = new Date(currentYear, currentMonth + 1, 0);

      const prevMonth = new Date(currentYear, currentMonth, 0);
      previousStart = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth(),
        1
      );
      previousEnd = new Date(
        prevMonth.getFullYear(),
        prevMonth.getMonth() + 1,
        0
      );
    }
  } catch (error) {
    console.error("Error in getDateRange:", error.message);
    throw error;
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
};

// Hook to update dwell_time in Reservation model
Reservation.afterUpdate(async (reservation, options) => {
  try {
    if (reservation.checkout_time && !reservation.dwell_time) {
      const checkin = reservation.checkin_time
        ? new Date(reservation.checkin_time)
        : new Date(reservation.reservation_time);
      const checkout = new Date(reservation.checkout_time);
      if (!isNaN(checkin) && !isNaN(checkout) && checkout > checkin) {
        const diffMs = checkout - checkin;
        const diffMin = Math.floor(diffMs / 60000); // Convert to minutes
        await reservation.update({ dwell_time: diffMin }, { hooks: false });
      }
    }
  } catch (error) {
    console.error("Error updating dwell_time:", error.message);
  }
});

// Overview Stats
const getOverviewStats = async (req, res) => {
  try {
    const { month, year, startDate, endDate } = req.query;
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getDateRange(month, year, startDate, endDate);

    // const dailyStartDate = new Date(monthlyStartDate);
    // const dailyEndDate = new Date(monthlyEndDate);
    const currentStats = {
      dailyRevenue: 0,
      totalBookings: 0,
      bookingSuccessRate: 0,
      dailyCustomers: 0,
      avgServeTime: 0,
      servingCustomers: 0,
      cancelledOrders: 0,
    };

    // --- Thống kê theo tháng ---
    const previousStats = { ...currentStats };

    // Doanh thu theo ngày với safer handling
    currentStats.dailyRevenue =
      (await Bill.sum("total_amount", {
        where: {
          time: {
            [Op.between]: [
              new Date(new Date().setHours(0, 0, 0, 0)),
              new Date(new Date().setHours(23, 59, 59, 999)),
            ],
          },
        },
      })) || 0;

    previousStats.dailyRevenue =
      (await Bill.sum("total_amount", {
        where: {
          time: {
            [Op.between]: [
              new Date(
                new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
                  0,
                  0,
                  0,
                  0
                )
              ),
              new Date(
                new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
                  23,
                  59,
                  59,
                  999
                )
              ),
            ],
          },
        },
      })) || 0;

    // Tổng số đặt bàn
    currentStats.totalBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [currentStart, currentEnd] },
        },
      })) || 0;

    previousStats.totalBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [previousStart, previousEnd] },
        },
      })) || 0;

    // Booking success rate
    const currentCompletedBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [currentStart, currentEnd] },
          status: "completed",
        },
      })) || 0;
    currentStats.bookingSuccessRate =
      currentStats.totalBookings > 0
        ? (currentCompletedBookings / currentStats.totalBookings) * 100
        : 0;

    const previousCompletedBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [previousStart, previousEnd] },
          status: "completed",
        },
      })) || 0;
    previousStats.bookingSuccessRate =
      previousStats.totalBookings > 0
        ? (previousCompletedBookings / previousStats.totalBookings) * 100
        : 0;

    // Khách hàng trong ngày
    currentStats.dailyCustomers =
      (await Reservation.sum("num_people", {
        where: {
          reservation_time: {
            [Op.between]: [
              new Date(new Date().setHours(0, 0, 0, 0)),
              new Date(new Date().setHours(23, 59, 59, 999)),
            ],
          },
        },
      })) || 0;

    previousStats.dailyCustomers =
      (await Reservation.sum("num_people", {
        where: {
          reservation_time: {
            [Op.between]: [
              new Date(
                new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
                  0,
                  0,
                  0,
                  0
                )
              ),
              new Date(
                new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
                  23,
                  59,
                  59,
                  999
                )
              ),
            ],
          },
        },
      })) || 0;

    // Thời gian phục vụ trung bình
    const currentDwellTimeAvg = await Reservation.findOne({
      attributes: [[Sequelize.fn("AVG", Sequelize.col("dwell_time")), "avg"]],
      where: {
        reservation_time: { [Op.between]: [currentStart, currentEnd] },
        status: "completed",
        dwell_time: { [Op.ne]: null },
      },
    });
    currentStats.avgServeTime = currentDwellTimeAvg?.dataValues?.avg
      ? Math.round(currentDwellTimeAvg.dataValues.avg)
      : 0;

    const previousDwellTimeAvg = await Reservation.findOne({
      attributes: [[Sequelize.fn("AVG", Sequelize.col("dwell_time")), "avg"]],
      where: {
        reservation_time: { [Op.between]: [previousStart, previousEnd] },
        status: "completed",
        dwell_time: { [Op.ne]: null },
      },
    });
    previousStats.avgServeTime = previousDwellTimeAvg?.dataValues?.avg
      ? Math.round(previousDwellTimeAvg.dataValues.avg)
      : 0;

    // Khách hàng đang phục vụ
    currentStats.servingCustomers =
      (await Reservation.sum("num_people", {
        where: {
          reservation_time: { [Op.between]: [currentStart, currentEnd] },
          status: "serving",
        },
      })) || 0;

    previousStats.servingCustomers =
      (await Reservation.sum("num_people", {
        where: {
          reservation_time: { [Op.between]: [previousStart, previousEnd] },
          status: "serving",
        },
      })) || 0;

    // Số món bị hủy
    currentStats.cancelledOrders =
      (await OrderItem.count({
        where: {
          status: "cancelled",
          createdAt: { [Op.between]: [currentStart, currentEnd] },
        },
      })) || 0;

    previousStats.cancelledOrders =
      (await OrderItem.count({
        where: {
          status: "cancelled",
          createdAt: { [Op.between]: [previousStart, previousEnd] },
        },
      })) || 0;

    res.status(200).json({ current: currentStats, previous: previousStats });
  } catch (error) {
    console.error("Error in getOverviewStats:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to fetch overview stats",
      details: error.message,
    });
  }
};

// Doanh thu Stats
const getRevenueStats = async (req, res) => {
  try {
    const { month, year, startDate, endDate } = req.query || {};
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getDateRange(month, year, startDate, endDate);

    const currentStats = {
      totalRevenue: 0,
      monthlyRevenue: [],
      weeklyRevenue: [],
      hourlyRevenue: [],
      revenueByCategory: [],
      forecastRevenue: 0,
    };

    const previousStats = { ...currentStats };

    // Fetch bills with validation
    const billsCurrent =
      (await Bill.findAll({
        where: { time: { [Op.between]: [currentStart, currentEnd] } },
      })) || [];
    const billsPrevious =
      (await Bill.findAll({
        where: { time: { [Op.between]: [previousStart, previousEnd] } },
      })) || [];

    // Tính tổng doanh thu with safe number conversion
    currentStats.totalRevenue = billsCurrent.reduce((sum, bill) => {
      const amount = Number(bill?.total_amount) || 0;
      return sum + amount;
    }, 0);

    previousStats.totalRevenue = billsPrevious.reduce((sum, bill) => {
      const amount = Number(bill?.total_amount) || 0;
      return sum + amount;
    }, 0);

    // Doanh thu theo tháng
    currentStats.monthlyRevenue = await Bill.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("time")), "month"],
        [Sequelize.fn("SUM", Sequelize.col("total_amount")), "revenue"],
      ],
      where: {
        time: {
          [Op.between]: [
            new Date(currentStart.getFullYear(), 0, 1),
            currentEnd,
          ],
        },
      },
      group: [Sequelize.fn("MONTH", Sequelize.col("time"))],
    });

    previousStats.monthlyRevenue = await Bill.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("time")), "month"],
        [Sequelize.fn("SUM", Sequelize.col("total_amount")), "revenue"],
      ],
      where: {
        time: {
          [Op.between]: [
            new Date(previousStart.getFullYear(), 0, 1),
            previousEnd,
          ],
        },
      },
      group: [Sequelize.fn("MONTH", Sequelize.col("time"))],
    });

    // Doanh thu theo tuần
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      currentStats.weeklyRevenue.push({
        day: days[i],
        revenue: billsCurrent
          .filter((b) => {
            if (!b?.time) return false;
            const date = new Date(b.time);
            return !isNaN(date) && date.getDay() === i;
          })
          .reduce((sum, bill) => {
            const amount = Number(bill?.total_amount) || 0;
            return sum + amount;
          }, 0),
      });
      previousStats.weeklyRevenue.push({
        day: days[i],
        revenue: billsPrevious
          .filter((b) => {
            if (!b?.time) return false;
            const date = new Date(b.time);
            return !isNaN(date) && date.getDay() === i;
          })
          .reduce((sum, bill) => {
            const amount = Number(bill?.total_amount) || 0;
            return sum + amount;
          }, 0),
      });
    }

    // HDoanh thu theo giờ
    for (let i = 0; i < 24; i++) {
      currentStats.hourlyRevenue.push({
        hour: `${i}h`,
        revenue: billsCurrent
          .filter((b) => {
            if (!b?.time) return false;
            const date = new Date(b.time);
            return !isNaN(date) && date.getHours() === i;
          })
          .reduce((sum, bill) => {
            const amount = Number(bill?.total_amount) || 0;
            return sum + amount;
          }, 0),
      });
      previousStats.hourlyRevenue.push({
        hour: `${i}h`,
        revenue: billsPrevious
          .filter((b) => {
            if (!b?.time) return false;
            const date = new Date(b.time);
            return !isNaN(date) && date.getHours() === i;
          })
          .reduce((sum, bill) => {
            const amount = Number(bill?.total_amount) || 0;
            return sum + amount;
          }, 0),
      });
    }

    // Revenue by category
    const currentOrders =
      (await OrderItem.findAll({
        where: { createdAt: { [Op.between]: [currentStart, currentEnd] } },
        include: [
          {
            model: Menu,
            as: "menu",
            attributes: ["category", "price"],
            required: false,
          },
        ],
      })) || [];
    const prevOrders =
      (await OrderItem.findAll({
        where: { createdAt: { [Op.between]: [previousStart, previousEnd] } },
        include: [
          {
            model: Menu,
            as: "menu",
            attributes: ["category", "price"],
            required: false,
          },
        ],
      })) || [];

    const categoryMap = new Map();
    const prevCategoryMap = new Map();

    currentOrders.forEach((order) => {
      if (!order?.menu) return;
      const category = order.menu.category || "Unknown";
      const price = Number(order.menu.price) || 0;
      const quantity = Number(order.quantity) || 0;
      const revenue = quantity * price;
      if (categoryMap.has(category)) {
        categoryMap.get(category).revenue += revenue;
      } else {
        categoryMap.set(category, { category, revenue, dishes: [] });
      }
    });

    prevOrders.forEach((order) => {
      if (!order?.menu) return;
      const category = order.menu.category || "Unknown";
      const price = Number(order.menu.price) || 0;
      const quantity = Number(order.quantity) || 0;
      const revenue = quantity * price;
      if (prevCategoryMap.has(category)) {
        prevCategoryMap.get(category).revenue += revenue;
      } else {
        prevCategoryMap.set(category, { category, revenue, dishes: [] });
      }
    });

    currentStats.revenueByCategory = Array.from(categoryMap.values());
    previousStats.revenueByCategory = Array.from(prevCategoryMap.values());

    // Forecast revenue
    const growthRate =
      previousStats.totalRevenue > 0
        ? (currentStats.totalRevenue - previousStats.totalRevenue) /
          previousStats.totalRevenue
        : 0;
    currentStats.forecastRevenue = currentStats.totalRevenue * (1 + growthRate);
    previousStats.forecastRevenue =
      previousStats.totalRevenue * (1 + growthRate);

    res.status(200).json({ current: currentStats, previous: previousStats });
  } catch (error) {
    console.error("Error in getRevenueStats:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to fetch revenue stats",
      details: error.message,
    });
  }
};

// Dishes Stats
const getDishesStats = async (req, res) => {
  try {
    const { month, year, startDate, endDate } = req.query || {};
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getDateRange(month, year, startDate, endDate);

    const currentStats = {
      topDishes: [],
      leastSoldDish: { name: "", sold: 0 },
      revenueByCategory: [],
    };
    const previousStats = { ...currentStats };

    const currentOrders = await OrderItem.findAll({
      where: { createdAt: { [Op.between]: [currentStart, currentEnd] } },
      include: [
        {
          model: Menu,
          as: "menu",
          attributes: ["name", "image", "category", "price", "description"], // Thêm description
          required: false,
        },
      ],
    });
    const prevOrders =
      (await OrderItem.findAll({
        where: { createdAt: { [Op.between]: [previousStart, previousEnd] } },
        include: [
          {
            model: Menu,
            as: "menu",
            attributes: ["name", "image", "category", "price"],
            required: false,
          },
        ],
      })) || [];

    const dishMap = new Map();
    const prevDishMap = new Map();

    currentOrders.forEach((order) => {
      if (!order?.menu) return;
      const dishName = order.menu.name || "Unknown";
      const quantity = Number(order.quantity) || 0;
      if (dishMap.has(dishName)) {
        dishMap.get(dishName).sold += quantity;
      } else {
        dishMap.set(dishName, {
          name: dishName,
          sold: quantity,
          image:
            order.menu.image ||
            "https://res.cloudinary.com/drem0ihib/image/upload/v1746546155/Logo_uujqeu.png",
          price: order.menu.price || 0,
          description: order.menu.description || "", // Thêm description
          category: order.menu.category || "Unknown",
        });
      }
    });

    prevOrders.forEach((order) => {
      if (!order?.menu) return;
      const dishName = order.menu.name || "Unknown";
      const quantity = Number(order.quantity) || 0;
      if (prevDishMap.has(dishName)) {
        prevDishMap.get(dishName).sold += quantity;
      } else {
        prevDishMap.set(dishName, {
          name: dishName,
          sold: quantity,
          image:
            order.menu.image ||
            "https://res.cloudinary.com/drem0ihib/image/upload/v1746546155/Logo_uujqeu.png",
          price: order.menu.price || 0,
        });
      }
    });

    const currentDishes = Array.from(dishMap.values());
    const prevDishes = Array.from(prevDishMap.values());

    currentStats.topDishes = currentDishes
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 3)
      .map((dish) => ({
        ...dish,
        revenue: dish.sold * (dish.price || 0),
      }));
    currentStats.leastSoldDish = currentDishes.length
      ? currentDishes.sort((a, b) => (a.sold || 0) - (b.sold || 0))[0]
      : {
          name: "",
          sold: 0,
          revenue: 0,
          image: "",
          description: "",
          category: "",
        };
    previousStats.topDishes = prevDishes
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 3)
      .map((dish) => ({
        ...dish,
        revenue: dish.sold * (dish.price || 0),
      }));
    previousStats.leastSoldDish = prevDishes.length
      ? prevDishes.sort((a, b) => (a.sold || 0) - (b.sold || 0))[0]
      : { name: "", sold: 0, revenue: 0 };

    const categoryMap = new Map();
    const prevCategoryMap = new Map();

    currentOrders.forEach((order) => {
      if (!order?.menu) return;
      const category = order.menu.category || "Unknown";
      const price = Number(order.menu.price) || 0;
      const quantity = Number(order.quantity) || 0;
      const revenue = quantity * price;
      if (categoryMap.has(category)) {
        categoryMap.get(category).revenue += revenue;
      } else {
        categoryMap.set(category, { category, revenue, dishes: [] });
      }
    });

    prevOrders.forEach((order) => {
      if (!order?.menu) return;
      const category = order.menu.category || "Unknown";
      const price = Number(order.menu.price) || 0;
      const quantity = Number(order.quantity) || 0;
      const revenue = quantity * price;
      if (prevCategoryMap.has(category)) {
        prevCategoryMap.get(category).revenue += revenue;
      } else {
        prevCategoryMap.set(category, { category, revenue, dishes: [] });
      }
    });

    currentStats.revenueByCategory = Array.from(categoryMap.values());
    previousStats.revenueByCategory = Array.from(prevCategoryMap.values());

    res.status(200).json({ current: currentStats, previous: previousStats });
  } catch (error) {
    console.error("Error in getDishesStats:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to fetch dishes stats",
      details: error.message,
    });
  }
};

// Customers Stats
const getCustomersStats = async (req, res) => {
  try {
    const { month, year, startDate, endDate } = req.query || {};
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getDateRange(month, year, startDate, endDate);

    const currentStats = {
      newCustomers: 0,
      returningCustomers: 0,
      topPotentialCustomers: [],
    };
    const previousStats = { ...currentStats };

    // Count new customers
    currentStats.newCustomers =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [currentStart, currentEnd] },
        },
        include: [
          {
            model: Customer,
            as: "customer",
            where: { createdAt: { [Op.between]: [currentStart, currentEnd] } },
            required: true,
          },
        ],
      })) || 0;

    previousStats.newCustomers =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [previousStart, previousEnd] },
        },
        include: [
          {
            model: Customer,
            as: "customer",
            where: {
              createdAt: { [Op.between]: [previousStart, previousEnd] },
            },
            required: true,
          },
        ],
      })) || 0;

    // Count returning customers
    currentStats.returningCustomers =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [currentStart, currentEnd] },
        },
        include: [
          {
            model: Customer,
            as: "customer",
            required: true,
            where: { createdAt: { [Op.lt]: currentStart } },
          },
        ],
      })) || 0;

    previousStats.returningCustomers =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [previousStart, previousEnd] },
        },
        include: [
          {
            model: Customer,
            as: "customer",
            required: true,
            where: { createdAt: { [Op.lt]: previousStart } },
          },
        ],
      })) || 0;

    const currentCustomerVisits = new Map();
    const prevCustomerVisits = new Map();

    // Fetch current reservations with Bill included
    const currentReservations = (await Reservation.findAll({
      where: {
        reservation_time: { [Op.between]: [currentStart, currentEnd] },
      },
      include: [
        {
          model: Customer,
          as: "customer",
          required: true,
          attributes: ["customer_id", "name", "phoneNumber"],
        },
        {
          model: Bill,
          as: "bill",
          attributes: ["total_amount"],
          required: false,
        },
      ],
    })) || [];

    currentReservations.forEach((res) => {
      if (!res?.customer) return;
      const name = res.customer.name || "Unknown";
      currentCustomerVisits.set(name, (currentCustomerVisits.get(name) || 0) + 1);
    });

    // Fetch previous reservations with Bill included
    const prevReservations = (await Reservation.findAll({
      where: {
        reservation_time: { [Op.between]: [previousStart, previousEnd] },
      },
      include: [
        {
          model: Customer,
          as: "customer",
          required: true,
          attributes: ["customer_id", "name", "phoneNumber"],
        },
        {
          model: Bill,
          as: "bill",
          attributes: ["total_amount"],
          required: false,
        },
      ],
    })) || [];

    prevReservations.forEach((res) => {
      if (!res?.customer) return;
      const name = res.customer.name || "Unknown";
      prevCustomerVisits.set(name, (prevCustomerVisits.get(name) || 0) + 1);
    });

    currentStats.topPotentialCustomers = Array.from(currentCustomerVisits.entries())
      .map(([name, visits]) => {
        const customer = currentReservations.find((r) => r.customer?.name === name)?.customer;
        const totalBill = currentReservations
          .filter((r) => r.customer?.name === name && r.bill)
          .reduce((sum, r) => sum + (Number(r.bill?.total_amount) || 0), 0);
        return {
          customer_id: customer?.customer_id || null,
          name,
          visits,
          totalBill,
          phone: customer?.phoneNumber || "Chưa có thông tin số điện thoại",
        };
      })
      .filter((customer) => customer.visits > 0)
      .sort(
        (a, b) =>
          (b.totalBill || 0) - (a.totalBill || 0) || (b.visits || 0) - (a.visits || 0)
      )
      .slice(0, 3);

    previousStats.topPotentialCustomers = Array.from(prevCustomerVisits.entries())
      .map(([name, visits]) => {
        const customer = prevReservations.find((r) => r.customer?.name === name)?.customer;
        const totalBill = prevReservations
          .filter((r) => r.customer?.name === name && r.bill)
          .reduce((sum, r) => sum + (Number(r.bill?.total_amount) || 0), 0);
        return {
          customer_id: customer?.customer_id || null,
          name,
          visits,
          totalBill,
          phone: customer?.phoneNumber || "Chưa có thông tin số điện thoại",
        };
      })
      .filter((customer) => customer.visits > 0)
      .sort(
        (a, b) =>
          (b.totalBill || 0) - (a.totalBill || 0) || (b.visits || 0) - (a.visits || 0)
      )
      .slice(0, 3);

    res.status(200).json({ current: currentStats, previous: previousStats });
  } catch (error) {
    console.error("Error in getCustomersStats:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to fetch customers stats",
      details: error.message,
    });
  }
};

// Customer Details
const getCustomerDetails = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Validate customerId
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    const customer = await Customer.findOne({
      where: { customer_id: parseInt(customerId) },
      attributes: ["name", "phoneNumber"],
      raw: true,
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Return customer details with phone number
    res.status(200).json({
      name: customer.name || "Unknown",
      phone: customer.phoneNumber || "Chưa có thông tin số điện thoại",
    });
  } catch (error) {
    console.error("Error in getCustomerDetails:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to fetch customer details",
      details: error.message,
    });
  }
};

// Reservations Stats
const getReservationsStats = async (req, res) => {
  try {
    const { month, year, startDate, endDate } = req.query || {};
    const { currentStart, currentEnd, previousStart, previousEnd } =
      getDateRange(month, year, startDate, endDate);

    const currentStats = {
      totalBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      dwellTime: 0,
      servedCustomersData: [],
      popularBookingTimes: [],
    };
    const previousStats = { ...currentStats };

    currentStats.totalBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [currentStart, currentEnd] },
        },
      })) || 0;
    previousStats.totalBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [previousStart, previousEnd] },
        },
      })) || 0;

    currentStats.confirmedBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [currentStart, currentEnd] },
          status: "completed",
        },
      })) || 0;
    previousStats.confirmedBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [previousStart, previousEnd] },
          status: "completed",
        },
      })) || 0;

    currentStats.cancelledBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [currentStart, currentEnd] },
          status: "cancelled",
        },
      })) || 0;
    previousStats.cancelledBookings =
      (await Reservation.count({
        where: {
          reservation_time: { [Op.between]: [previousStart, previousEnd] },
          status: "cancelled",
        },
      })) || 0;

    const currentDwellTimeAvg = await Reservation.findOne({
      attributes: [[Sequelize.fn("AVG", Sequelize.col("dwell_time")), "avg"]],
      where: {
        reservation_time: { [Op.between]: [currentStart, currentEnd] },
        status: "completed",
        dwell_time: { [Op.ne]: null },
      },
    });
    currentStats.dwellTime = currentDwellTimeAvg?.dataValues?.avg
      ? Math.round(currentDwellTimeAvg.dataValues.avg)
      : 0;

    const previousDwellTimeAvg = await Reservation.findOne({
      attributes: [[Sequelize.fn("AVG", Sequelize.col("dwell_time")), "avg"]],
      where: {
        reservation_time: { [Op.between]: [previousStart, previousEnd] },
        status: "completed",
        dwell_time: { [Op.ne]: null },
      },
    });
    previousStats.dwellTime = previousDwellTimeAvg?.dataValues?.avg
      ? Math.round(previousDwellTimeAvg.dataValues.avg)
      : 0;

    for (let i = 0; i < 24; i++) {
      currentStats.servedCustomersData.push({
        timeSlot: `${i}h`,
        count:
          (await Reservation.sum("num_people", {
            where: {
              reservation_time: { [Op.between]: [currentStart, currentEnd] },
              status: "completed",
              [Op.and]: Sequelize.where(
                Sequelize.fn("HOUR", Sequelize.col("reservation_time")),
                i
              ),
            },
          })) || 0,
      });
      previousStats.servedCustomersData.push({
        timeSlot: `${i}h`,
        count:
          (await Reservation.sum("num_people", {
            where: {
              reservation_time: { [Op.between]: [previousStart, previousEnd] },
              status: "completed",
              [Op.and]: Sequelize.where(
                Sequelize.fn("HOUR", Sequelize.col("reservation_time")),
                i
              ),
            },
          })) || 0,
      });
    }

    const currentTimeMap = new Map();
    const prevTimeMap = new Map();
    (
      await Reservation.findAll({
        where: {
          reservation_time: { [Op.between]: [currentStart, currentEnd] },
        },
      })
    ).forEach((res) => {
      if (!res?.reservation_time) return;
      const hour = new Date(res.reservation_time).getHours();
      currentTimeMap.set(`${hour}h`, (currentTimeMap.get(`${hour}h`) || 0) + 1);
    });
    (
      await Reservation.findAll({
        where: {
          reservation_time: { [Op.between]: [previousStart, previousEnd] },
        },
      })
    ).forEach((res) => {
      if (!res?.reservation_time) return;
      const hour = new Date(res.reservation_time).getHours();
      prevTimeMap.set(`${hour}h`, (prevTimeMap.get(`${hour}h`) || 0) + 1);
    });

    currentStats.popularBookingTimes = Array.from(currentTimeMap.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count);
    previousStats.popularBookingTimes = Array.from(prevTimeMap.entries())
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json({ current: currentStats, previous: previousStats });
  } catch (error) {
    console.error("Error in getReservationsStats:", error.message, error.stack);
    res.status(500).json({
      error: "Failed to fetch reservations stats",
      details: error.message,
    });
  }
};

// Category Dishes Stats
const getCategoryDishesStats = async (req, res) => {
  try {
    const { month, year, startDate, endDate, category } = req.query || {};
    const { currentStart, currentEnd } = getDateRange(
      month,
      year,
      startDate,
      endDate
    );

    const whereClause = {
      createdAt: { [Op.between]: [currentStart, currentEnd] },
    };

    const menuWhereClause = category ? { category } : {};

    const orders =
      (await OrderItem.findAll({
        where: whereClause,
        include: [
          {
            model: Menu,
            as: "menu",
            attributes: ["name", "category", "price"],
            where: menuWhereClause,
            required: false,
          },
        ],
      })) || [];

    const dishMap = new Map();

    orders.forEach((order) => {
      if (!order?.menu) return;
      const dishName = order.menu.name || "Unknown";
      const price = Number(order.menu.price) || 0;
      const quantity = Number(order.quantity) || 0;
      const revenue = quantity * price;
      if (dishMap.has(dishName)) {
        const existing = dishMap.get(dishName);
        existing.sold += quantity;
        existing.revenue += revenue;
      } else {
        dishMap.set(dishName, {
          name: dishName,
          sold: quantity,
          revenue,
          category: order.menu.category || "Unknown",
          price: price,
        });
      }
    });

    const dishes = Array.from(dishMap.values()).sort(
      (a, b) => (b.sold || 0) - (a.sold || 0)
    );

    res.status(200).json({ dishes });
  } catch (error) {
    console.error(
      "Error in getCategoryDishesStats:",
      error.message,
      error.stack
    );
    res.status(500).json({
      error: "Failed to fetch category dishes stats",
      details: error.message,
    });
  }
};

module.exports = {
  getOverviewStats,
  getRevenueStats,
  getDishesStats,
  getCustomersStats,
  getReservationsStats,
  getCategoryDishesStats,
  getCustomerDetails,
};
