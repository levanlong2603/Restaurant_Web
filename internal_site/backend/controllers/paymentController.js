const config = require("config");
const { sequelize, Reservation, Bill } = require('../models');
const querystring = require("qs");
const crypto = require("crypto");

// Ensure timezone is Asia/Ho_Chi_Minh
process.env.TZ = "Asia/Ho_Chi_Minh";

let dateFormat;

async function initializeDateFormat() {
  const module = await import('dateformat');
  dateFormat = module.default;
}
initializeDateFormat();

// Initialize datefo
function sortObject(obj) {
  const sorted = {};
  const str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const paymentController = {
  createPaymentUrl: async function (req, res, next) {
    const { default: dateFormat } = await import("dateformat"); // Di chuyển vào đây
    const startTime = Date.now();
    try {
      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress ||
        "127.0.0.1";

      const tmnCode = config.get("vnp_TmnCode");
      const secretKey = config.get("vnp_HashSecret");
      const vnpUrl = config.get("vnp_Url");
      const returnUrl = config.get("vnp_ReturnUrl");

      console.log("Config:", {
        tmnCode,
        secretKey: secretKey.slice(0, 4) + "...",
        vnpUrl,
        returnUrl,
      });

      const currentDate = new Date();
      const createDate = dateFormat(currentDate, "yyyymmddHHMMss");

      console.log(
        "Server time (Vietnam):",
        currentDate.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      );
      console.log("vnp_CreateDate:", createDate);

      const orderId =
        dateFormat(currentDate, "HHMMss") +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0");
      const amount = parseInt(req.body.amount);
      const bankCode = req.body.bankCode || "";
      const orderInfo = encodeURIComponent(
        req.body.orderDescription || "Payment for reservation"
      ).replace(/%20/g, "+");
      const orderType = req.body.orderType || "billpayment";
      const locale = req.body.language || "vn";
      const currCode = "VND";

      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount: must be a positive number");
      }
      if (!orderInfo) {
        throw new Error("Order description is required");
      }
      if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
        throw new Error("VNPAY configuration is incomplete");
      }
      if (!orderId || orderId.length !== 12) {
        throw new Error("Invalid vnp_TxnRef: must be exactly 12 characters");
      }
      if (!createDate || !/^\d{14}$/.test(createDate)) {
        throw new Error(
          "Invalid vnp_CreateDate: must be in YYYYMMDDHHMMSS format"
        );
      }

      const vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      if (bankCode) {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      const sortedParams = sortObject(vnp_Params);
      console.log("vnp_Params for signing:", sortedParams);

      const signData = querystring.stringify(sortedParams, { encode: false });
      console.log("signData:", signData);

      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      console.log("signed:", signed);

      sortedParams["vnp_SecureHash"] = signed;

      const paymentUrl =
        vnpUrl + "?" + querystring.stringify(sortedParams, { encode: false });
      console.log("paymentUrl:", paymentUrl);
      console.log("Processing time (ms):", Date.now() - startTime);

      res.json({ paymentUrl });
    } catch (error) {
      console.error("Error creating paymentUrl:", error.message);
      res
        .status(500)
        .json({ message: error.message || "Failed to create payment URL" });
    }
  },

  vnpayReturn: function (req, res, next) {
    try {
      let vnp_Params = req.query;
      const secureHash = vnp_Params["vnp_SecureHash"];
      console.log(
        "Callback time (Vietnam):",
        new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      );

      console.log("vnp_Params before sorting:", vnp_Params);
      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];
      vnp_Params = sortObject(vnp_Params);
      console.log("vnp_Params after sorting:", vnp_Params);

      const secretKey = config.get("vnp_HashSecret");
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      console.log("signed:", signed, "vnp_SecureHash:", secureHash);

      const responseCode = vnp_Params["vnp_ResponseCode"];
      const transactionId = vnp_Params["vnp_TxnRef"];
      const amount = vnp_Params["vnp_Amount"] / 100;
      const transactionTime = new Date().toLocaleString();

      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Kết quả thanh toán</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f0f0; }
            .container { text-align: center; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: white; }
            .success { color: green; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Kết quả thanh toán</h2>
            ${
              secureHash === signed
                ? responseCode === "00"
                  ? `
                    <p class="success">Thanh toán thành công!</p>
                    <p><strong>Mã giao dịch:</strong> ${transactionId}</p>
                    <p><strong>Số tiền:</strong> ${amount} VNĐ</p>
                    <p><strong>Thời gian:</strong> ${transactionTime}</p>
                  `
                  : `
                    <p class="error">Thanh toán thất bại (Mã lỗi: ${responseCode})</p>
                    <p><strong>Mã giao dịch:</strong> ${transactionId}</p>
                    <p><strong>Thời gian:</strong> ${transactionTime}</p>
                  `
                : `
                  <p class="error">Chữ ký không hợp lệ (Mã lỗi: 97)</p>
                  <p><strong>Mã giao dịch:</strong> ${transactionId}</p>
                  <p><strong>Thời gian:</strong> ${transactionTime}</p>
                `
            }
            <p>Tab này sẽ tự động đóng sau 5 giây...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'PAYMENT_COMPLETED',
                success: ${
                  secureHash === signed && responseCode === "00"
                    ? "true"
                    : "false"
                },
                transactionId: '${transactionId}',
                responseCode: '${responseCode}'
              }, '*');
            }
            setTimeout(() => {
              window.close();
            }, 5000);
          </script>
        </body>
        </html>
      `;

      res.send(htmlResponse);
    } catch (error) {
      console.error("Error processing vnpay_return:", error.message);
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lỗi</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f0f0; }
            .container { text-align: center; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: white; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <div class="container">
            <p class="error">Lỗi xử lý phản hồi từ VNPAY (Mã lỗi: 99)</p>
            <p>Tab này sẽ tự động đóng sau 5 giây...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'PAYMENT_COMPLETED',
                success: false,
                responseCode: '99'
              }, '*');
            }
            setTimeout(() => {
              window.close();
            }, 5000);
          </script>
        </body>
        </html>
      `);
    }
  },

  vnpayIpn: function (req, res, next) {
    try {
      let vnp_Params = req.query;
      const secureHash = vnp_Params["vnp_SecureHash"];

      console.log("vnp_Params before sorting:", vnp_Params);
      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];
      vnp_Params = sortObject(vnp_Params);
      console.log("vnp_Params after sorting:", vnp_Params);

      const secretKey = config.get("vnp_HashSecret");
      const signData = querystring.stringify(vnp_Params, { encode: false });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      console.log("signed:", signed, "vnp_SecureHash:", secureHash);

      if (secureHash === signed) {
        const rspCode = vnp_Params["vnp_ResponseCode"];
        res.status(200).json({ RspCode: "00", Message: "success" });
      } else {
        res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
      }
    } catch (error) {
      console.error("Error processing vnpay_ipn:", error.message);
      res.status(200).json({ RspCode: "99", Message: "Unknown error" });
    }
  },

  cashPayment: async function (req, res) {
    const transaction = await sequelize.transaction();
    try {
      const reservation_id = req.params.reservation_id || req.params.id;
      const { amount, status } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error("Số tiền không hợp lệ");
      }
      if (!["paid", "completed"].includes(status)) {
        throw new Error(
          'Trạng thái không hợp lệ (chỉ chấp nhận "paid" hoặc "completed")'
        );
      }
      if (isNaN(Number(reservation_id))) {
        throw new Error("Reservation ID không hợp lệ");
      }

      // Lấy thông tin reservation hiện tại
      const reservation = await Reservation.findByPk(reservation_id, {
        transaction,
      });
      if (!reservation) {
        throw new Error("Không tìm thấy reservation");
      }

      // Tạo bản ghi mới trong bảng Bill
      const staff_id = req.user?.user_id || req.user?.id || 1; // prefer user_id
      await Bill.create(
        {
          reservation_id,
          staff_id,
          payment_method: "cash",
          total_amount: amount,
        },
        { transaction }
      );

      // Cập nhật trạng thái reservation
      await Reservation.update(
        { status: status },
        { where: { reservation_id: reservation_id }, transaction }
      );

      await transaction.commit();

      res.json({
        message: "Thanh toán bằng tiền mặt thành công",
        reservation_id,
        amount,
        status,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error processing cash payment:", error.message);
      res
        .status(500)
        .json({
          message: "Lỗi khi xử lý thanh toán tiền mặt",
          error: error.message,
        });
    }
  },
};

module.exports = paymentController;