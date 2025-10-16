const { Sequelize, Reservation, ReservationDetail, Table } = require('../models');
const moment = require('moment');


exports.getTableStatus = async (req, res) => {
    try {
        const { searchTime } = req.query;

        if (!searchTime) {
            return res.status(400).json({ message: "Vui lòng nhập thời gian tìm kiếm!" });
        }

        const oneHourBefore = moment(searchTime).subtract(1, 'hour');
        const oneHourAfter = moment(searchTime).add(1, 'hour');

        let tables = await Table.findAll();
        let reservations = await Reservation.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { status: 'serving' },
                    { reservation_time: { [Sequelize.Op.between]: [oneHourBefore, oneHourAfter] } }
                ]
            }
        });

        let reservationDetails = await ReservationDetail.findAll({
            where: {
                reservation_id: reservations.map(res => res.reservation_id) 
            }
        });

        const tableStatus = tables.map(table => {
            const tableReservations = reservationDetails.filter(r => r.table_id === table.table_id);
            let status = 'Available';

            if (tableReservations.length > 0) {
                const latestReservationDetail = tableReservations[0];
                
                const reservation = reservations.find(res => res.reservation_id === latestReservationDetail.reservation_id);
                
                if (reservation) {
                    if (reservation.status === 'preparing') {
                        status = 'Booked';
                    } else if (reservation.status === 'serving' || reservation.status === 'paid' ) {
                        status = 'Occupied';
                    }
                }
            }
            
            return {
                table_id: table.table_id,
                name: table.name,
                status: status,
                reservationTime: tableReservations.length > 0 && reservations.find(res => res.reservation_id === tableReservations[0].reservation_id) 
                    ? reservations.find(res => res.reservation_id === tableReservations[0].reservation_id).reservation_time 
                    : null,
                reservation_id: tableReservations.length > 0 ? tableReservations[0].reservation_id : null
            };
        });

        res.status(200).json({
            timestamp: searchTime,
            tables: tableStatus
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getSeveredTables = async (req, res) => {
    try {
        let reservations = await Reservation.findAll({
            where: {
                    status: {
                        [Sequelize.Op.in]: ['serving', 'paid']
                    }
            }
        });

        let reservationDetails = await ReservationDetail.findAll({
            where: {
                reservation_id: reservations.map(res => res.reservation_id) 
            }
        });


        const servedTables = await Table.findAll({
            where: {
                table_id: reservationDetails.map(r => r.table_id)
            }
        });

            
        res.status(200).json({
            servedTables: servedTables
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}