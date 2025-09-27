const { sequelize } = require('../config/db');
const TableFactory = require('../models/Table'); // Yêu cầu file Table.js
const Table = TableFactory(sequelize); // Khởi tạo model với sequelize

const TOTAL_TABLES = 20;

const initializeTables = async () => {
    try {
        const currentCount = await Table.count();
        if (currentCount < TOTAL_TABLES) {
            const tables = [];
            for (let i = currentCount + 1; i <= TOTAL_TABLES; i++) {
                const capacity = i % 2 === 0 ? 4 : 2;
                tables.push({ capacity, createdAt: new Date(), updatedAt: new Date() });
            }
            await Table.bulkCreate(tables);
            console.log(`Đã tạo thêm ${TOTAL_TABLES - currentCount} bàn để đủ ${TOTAL_TABLES} bàn.`);
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra/tạo bàn:', error);
    }
};

module.exports = initializeTables;