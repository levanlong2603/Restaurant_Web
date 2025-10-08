const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const reservationController = require('./reservationController');
// Import models for realtime availability checks
const { Reservation, ReservationDetail, Table } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

// Reservation window (minutes) used to check conflicts around the requested time
const RESERVATION_DURATION_MINUTES = parseInt(process.env.RESERVATION_DURATION_MINUTES, 10) || 120;

// Define functions for LLM
const functions = [
  {
    name: 'bookTable',
    description: 'Đặt bàn tại nhà hàng',
    parameters: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string', description: 'Số điện thoại của khách hàng' },
        name: { type: 'string', description: 'Tên khách hàng' },
        time: { type: 'string', description: 'Thời gian đặt bàn (VD: 2025-05-11T19:00:00)' },
        people: { type: 'number', description: 'Số người' },
      },
      required: ['phoneNumber', 'name', 'time', 'people'],
    },
  },
  {
    name: 'getRestaurantInfo',
    description: 'Lấy thông tin cụ thể của nhà hàng (địa chỉ, số điện thoại, email, giờ mở cửa, hoặc bản đồ)',
    parameters: {
      type: 'object',
      properties: {
        infoType: {
          type: 'string',
          description: 'Loại thông tin được yêu cầu (address, phoneNumber, email, openingHours, mapLink)',
        },
      },
      required: ['infoType'],
    },
  },
  {
    name: 'getMenu',
    description: 'Lấy danh sách một vài món ăn trong menu nhà hàng',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Loại món ăn (appetizer, main_dish, side_dish, regional_specialty, vegetarian, dessert, beverage). Nếu không chỉ định, trả về từ toàn bộ menu.',
        },
        maxPrice: {
          type: 'number',
          description: 'Giá tối đa của món ăn (VNĐ). Nếu không chỉ định, không lọc theo giá.',
        },
        lightDish: {
          type: 'boolean',
          description: 'Lọc các món thanh đạm (nhẹ nhàng, ít dầu mỡ). Nếu true, trả về món thanh đạm.',
        },
        region: {
          type: 'string',
          description: 'Vùng miền của món ăn (miền Bắc, miền Nam, miền Trung). Nếu chỉ định, trả về món theo vùng miền.',
        },
        keyword: {
          type: 'string',
          description: 'Từ khóa tìm kiếm món ăn (VD: cơm, bún). Nếu chỉ định, trả về món có tên hoặc mô tả chứa từ khóa.',
        },
      },
    },
  },
  {
    name: 'getDishDetails',
    description: 'Lấy chi tiết món ăn (mô tả, giá)',
    parameters: {
      type: 'object',
      properties: {
        dishName: { type: 'string', description: 'Tên món ăn' },
        detailType: {
          type: 'string',
          description: 'Loại chi tiết (description, price)',
        },
      },
      required: ['dishName', 'detailType'],
    },
  },
  {
    name: 'suggestDish',
    description: 'Gợi ý một vài món ăn ngẫu nhiên hoặc theo danh mục, giá tối đa, món thanh đạm, vùng miền, hoặc từ khóa',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Loại món ăn (appetizer, main_dish, side_dish, regional_specialty, vegetarian, dessert, beverage). Nếu không chỉ định, gợi ý từ toàn bộ menu.',
        },
        maxPrice: {
          type: 'number',
          description: 'Giá tối đa của món ăn (VNĐ). Nếu không chỉ định, không lọc theo giá.',
        },
        lightDish: {
          type: 'boolean',
          description: 'Gợi ý các món thanh đạm (nhẹ nhàng, ít dầu mỡ). Nếu true, chỉ gợi ý món thanh đạm.',
        },
        region: {
          type: 'string',
          description: 'Vùng miền của món ăn (miền Bắc, miền Nam, miền Trung). Nếu chỉ định, gợi ý món theo vùng miền.',
        },
        keyword: {
          type: 'string',
          description: 'Từ khóa tìm kiếm món ăn (VD: cơm, bún). Nếu chỉ định, gợi ý món có tên hoặc mô tả chứa từ khóa.',
        },
      },
    },
  },
];

// Helper function to extract JSON string from raw text
function extractJsonString(rawText) {
  let match = rawText.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) {
    console.log('Đã tìm thấy JSON trong code block:', match[1]);
    return match[1];
  }

  match = rawText.match(/\{[\s\S]*\}/);
  if (match) {
    console.log('Đã tìm thấy JSON trực tiếp:', match[0]);
    return match[0];
  }

  console.log('Không tìm thấy JSON, trả về raw text:', rawText);
  return rawText;
}

// Gemini LLM Class
class GeminiLLM {
  constructor() {
    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey || apiKey.length < 10) {
        console.warn('GOOGLE_API_KEY not configured or seems invalid — Gemini will not be available');
        this.model = null;
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const defaultModel = process.env.GENERATIVE_MODEL || 'gemini-2.5-flash';
      console.log('Initializing Gemini model:', defaultModel);
      this.model = genAI.getGenerativeModel({ model: defaultModel });
    } catch (err) {
      console.error('Error initializing GeminiLLM:', err && err.message ? err.message : err);
      this.model = null;
    }
  }

  async generate(messages, { functions }) {
    const userMessage = messages[0];

    const enhancedPrompt = `
      Bạn là chatbot nhà hàng trả lời bằng tiếng Việt. Người dùng yêu cầu: "${userMessage}".

      Chỉ trả về JSON hợp lệ, không thêm bất kỳ văn bản nào khác ngoài JSON. Dùng định dạng:

      Nếu là lời chào (VD: "Xin chào", "Chào bạn", "Hi"):
      {
        "text": "Xin chào! Tôi có thể giúp bạn:\n- Đặt bàn ăn (cung cấp tên, số điện thoại, thời gian, số người).\n- Xem thông tin nhà hàng (địa chỉ, số điện thoại, email, giờ mở cửa, bản đồ).\n- Xem một vài món ăn (món chay, thanh đạm, theo vùng miền, hoặc món như cơm, bún).\n- Nhận gợi ý món ăn.\nHãy cho tôi biết bạn muốn làm gì!"
      }

      Nếu là yêu cầu đặt bàn và có đủ thông tin (số điện thoại, tên, thời gian định dạng ISO 8601, số người):
      {
        "function_call": {
          "name": "bookTable",
          "arguments": {
            "phoneNumber": string,
            "name": string,
            "time": string,
            "people": number
          }
        }
      }

      Nếu thiếu thông tin (VD: không có số điện thoại, tên, thời gian, hoặc số người):
      {
        "text": "Vui lòng cung cấp đầy đủ số điện thoại, tên, thời gian và số người."
      }

      Nếu là yêu cầu xem menu (VD: "xem menu", "menu nhà hàng", "món khai vị"):
      {
        "function_call": {
          "name": "getMenu",
          "arguments": {
            "category": string // "appetizer", "main_dish", "side_dish", "regional_specialty", "vegetarian", "dessert", "beverage"
          }
        }
      }

      Nếu là yêu cầu xem các món ăn theo giá (VD: "các món ăn giá dưới 20000", "món rẻ dưới 20k"):
      {
        "function_call": {
          "name": "getMenu",
          "arguments": {
            "maxPrice": 20000
          }
        }
      }

      Nếu là yêu cầu món chay (VD: "món chay", "đồ ăn chay"):
      {
        "function_call": {
          "name": "getMenu",
          "arguments": {
            "category": "vegetarian"
          }
        }
      }

      Nếu là yêu cầu món thanh đạm (VD: "món thanh đạm", "đồ ăn nhẹ nhàng"):
      {
        "function_call": {
          "name": "getMenu",
          "arguments": {
            "lightDish": true
          }
        }
      }

      Nếu là yêu cầu món theo vùng miền (VD: "món miền Bắc", "đặc sản miền Nam", "món miền Trung"):
      {
        "function_call": {
          "name": "getMenu",
          "arguments": {
            "region": string // "miền Bắc", "miền Nam", hoặc "miền Trung"
          }
        }
      }

      Nếu là yêu cầu món theo từ khóa (VD: "tôi muốn ăn cơm", "tôi muốn ăn bún", "cho tôi món cơm", "món bún"):
      {
        "function_call": {
          "name": "suggestDish",
          "arguments": {
            "keyword": string // "cơm", "bún", ...
          }
        }
      }

      Nếu là yêu cầu chi tiết món ăn (VD: "Súp cua là gì?", "Giá bánh khọt?"):
      {
        "function_call": {
          "name": "getDishDetails",
          "arguments": {
            "dishName": string,
            "detailType": string
          }
        }
      }

      Nếu là yêu cầu gợi ý món ăn (VD: "gợi ý món ăn", "món gì ngon?", "đề xuất món khai vị", "gợi ý món dưới 20k", "gợi ý món chay", "gợi ý món thanh đạm", "gợi ý món miền Bắc"):
      {
        "function_call": {
          "name": "suggestDish",
          "arguments": {
            "category": string,
            "maxPrice": number,
            "lightDish": boolean,
            "region": string
          }
        }
      }

      Nếu là yêu cầu hỏi thông tin nhà hàng:
      - Nếu hỏi "địa chỉ" hoặc "bản đồ":
        {
          "function_call": {
            "name": "getRestaurantInfo",
            "arguments": {
              "infoType": "address",
              "value": {
                "address": "8386 Đường Trần Phú, Hà Đông, Hà Nội",
                "mapLink": "https://www.google.com/maps/embed?pb=!1m18!m12!1m3!1d3725.2922764180553!2d105.78484157449498!3d20.980917989421535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accdd8a1ad71%3A0xa2f9b16036648187!2zSOG7jWMgdmnhu4duIEPDtG5nIG5naOG7hyBCxrB1IGNow61uaCB2aeG7hW4 gdGjDtG5n!5e0!3m2!1svi!2s!4v1746953082341!5m2!1svi!2s"
              }
            }
          }
        }
      - Nếu hỏi cụ thể một loại thông tin khác (VD: "số điện thoại", "email", "giờ mở cửa"):
        {
          "function_call": {
            "name": "getRestaurantInfo",
            "arguments": {
              "infoType": string,
              "value": string
            }
          }
        }
      - Nếu hỏi chung về thông tin nhà hàng (VD: "thông tin nhà hàng"):
        {
          "function_call": {
            "name": "getRestaurantInfo",
            "arguments": {
              "infoType": "all",
              "value": {
                "address": "8386 Đường Trần phú, Hà Đông, Hà Nội",
                "phoneNumber": "0928 892 424",
                "email": "contact@tinhhoaViet.com",
                "openingHours": "Sáng 10:00 - 14:00, Chiều 17:00 - 22:00",
                "mapLink": "https://www.google.com/maps/place/16+%C4%90%C6%B0%E1%BB%9Dng+V%E1%BA%A1n+Ph%C3%BAc,+V%E1%BA%A1n+Ph%C3%BAc,+H%C3%A0+%C4%90%C3%B4ng,+H%C3%A0+N%E1%BB%99i,+Vi%E1%BB%87t+Nam/@20.9765074,105.7735008,17z/data=!3m1!4b1!4m6!3m5!1s0x3134532e7d623f29:0x488c919ade0516d0!8m2!3d20.9765074!4d105.7760757!16s%2Fg%2F11h_ttbykj?entry=ttu&g_ep=EgoyMDI1MTAwNi4wIKXMDSoASAFQAw%3D%3D"
              }
            }
          }
        }

      Nếu không liên quan đến đặt bàn, thông tin nhà hàng, menu, hoặc gợi ý món:
      {
        "text": "Tôi không hiểu yêu cầu."
      }

      Thông tin nhà hàng:
      - Địa chỉ:  8386 Đường Trần phú, Hà Đông, Hà Nội
      - Số điện thoại: 0928 892 424
      - Email: contact@tinhhoaViet.com
      - Giờ mở cửa: Sáng 10:00 - 14:00, Chiều 17:00 - 22:00
      - Bản đồ: https://www.google.com/maps/place/16+%C4%90%C6%B0%E1%BB%9Dng+V%E1%BA%A1n+Ph%C3%BAc,+V%E1%BA%A1n+Ph%C3%BAc,+H%C3%A0+%C4%90%C3%B4ng,+H%C3%A0+N%E1%BB%99i,+Vi%E1%BB%87t+Nam/@20.9765074,105.7735008,17z/data=!3m1!4b1!4m6!3m5!1s0x3134532e7d623f29:0x488c919ade0516d0!8m2!3d20.9765074!4d105.7760757!16s%2Fg%2F11h_ttbykj?entry=ttu&g_ep=EgoyMDI1MTAwNi4wIKXMDSoASAFQAw%3D%3D

      Lưu ý:
      - Thời gian phải ở định dạng ISO 8601 (VD: "2025-05-11T19:00:00") cho đặt bàn.
      - Nếu hỏi "địa chỉ" hoặc "bản đồ", trả về cả địa chỉ và link Google Maps.
      - Chỉ trả về thông tin được yêu cầu cụ thể, không trả ra trực tiếp tên các thuộc tính trong database hoặc tên các phân loại.
      - Không thêm giải thích, chỉ trả về JSON.
    `;

    try {
      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });
      let text = result.response.text();

      text = extractJsonString(text);
      console.log('Kết quả từ Gemini:', text);

      try {
        const parsed = JSON.parse(text);
        console.log('Parsed JSON:', parsed);
        return parsed;
      } catch (err) {
        console.error('Lỗi khi parse JSON từ Gemini:', err.message, text);
        return { text: 'Có lỗi xảy ra khi xử lý yêu cầu.' };
      }
    } catch (err) {
      console.error('Lỗi API Google Generative AI:', err.message);
      return { text: 'Có lỗi xảy ra khi gọi API.' };
    }
  }
}

// Initialize LLM
let llm;
try {
  llm = new GeminiLLM();
  console.log('Khởi tạo Gemini LLM thành công');
} catch (error) {
  console.error('Không thể khởi tạo Gemini LLM:', error.message);
  throw error;
}

// Helper function to check if a URL is valid
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i.test(url) && !url.includes('Logo_uujqeu.png');
}

// Helper function to fetch all menu items
async function fetchAllMenuItems(category, maxPrice, lightDish, region, keyword) {
  let allItems = [];
  let currentPage = 1;
  let totalPages = 1;

  try {
    do {
      const url = `http://localhost:3000/menu?page=${currentPage}`;
      const response = await axios.get(url);
      const { menuItems, totalPages: pages, currentPage: page } = response.data;
      let filteredItems = menuItems.filter(item => !item.deleted);

      if (category) {
        filteredItems = filteredItems.filter(item => item.category === category);
      }

      if (maxPrice) {
        filteredItems = filteredItems.filter(item => parseFloat(item.price) <= maxPrice);
      }

      if (lightDish) {
        filteredItems = filteredItems.filter(
          item => item.description.toLowerCase().includes('nhẹ nhàng') ||
                  item.description.toLowerCase().includes('thanh đạm') ||
                  item.description.toLowerCase().includes('luộc') ||
                  item.description.toLowerCase().includes('hấp') ||
                  parseFloat(item.price) <= 20000
        );
      }

      if (region) {
        const regionLower = region.toLowerCase();
        filteredItems = filteredItems.filter(
          item => item.description.toLowerCase().includes(regionLower) ||
                  item.category === 'regional_specialty'
        );
      }

      if (keyword) {
        const keywordLower = keyword.toLowerCase();
        filteredItems = filteredItems.filter(
          item => item.name.toLowerCase().includes(keywordLower) ||
                  item.description.toLowerCase().includes(keywordLower)
        );
      }

      allItems = allItems.concat(filteredItems);
      totalPages = pages;
      currentPage = page + 1;
    } while (currentPage <= totalPages);
    return allItems;
  } catch (err) {
    console.error('Lỗi khi lấy menu từ API:', err.message);
    throw err;
  }
}

// Main controller function for chat processing
exports.processChat = async (req, res) => {
  console.log('Yêu cầu từ client:', req.body);
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    console.error('Lỗi: Tin nhắn không hợp lệ');
    return res.status(400).json({ message: 'Vui lòng cung cấp tin nhắn hợp lệ.' });
  }

  try {
    const response = await llm.generate([message], { functions });
    console.log('Phản hồi từ Gemini:', response);

    if (response.function_call) {
      const { name, arguments: functionArgs } = response.function_call;
      console.log('Function call:', name, functionArgs);

      if (name === 'bookTable') {
        if (!functionArgs.phoneNumber || !functionArgs.name || !functionArgs.time || !functionArgs.people) {
          return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ số điện thoại, tên, thời gian và số người.' });
        }

        // Realtime time validation
        const requestedTime = new Date(functionArgs.time);
        if (isNaN(requestedTime.getTime())) {
          return res.status(400).json({ message: 'Thời gian đặt bàn không hợp lệ. Vui lòng sử dụng định dạng ISO 8601.' });
        }
        const now = new Date();
        if (requestedTime.getTime() < now.getTime() - 5 * 60 * 1000) {
          return res.status(400).json({ message: 'Thời gian đặt bàn phải là thời gian trong tương lai.' });
        }

        // Compute conflict window
        const durationMinutes = parseInt(process.env.RESERVATION_DURATION_MINUTES, 10) || 120;
        const windowMs = durationMinutes * 60 * 1000;
        const windowStart = new Date(requestedTime.getTime() - windowMs / 2);
        const windowEnd = new Date(requestedTime.getTime() + windowMs / 2);

        // Find overlapping reservations
        try {
          const overlapping = await Reservation.findAll({
            where: {
              reservation_time: { [Op.between]: [windowStart, windowEnd] },
              status: { [Op.ne]: 'cancelled' }
            }
          });

          const overlappingIds = overlapping.map(r => r.id);
          let reservedCount = 0;
          if (overlappingIds.length > 0) {
            reservedCount = await ReservationDetail.count({ where: { reservation_id: overlappingIds } });
          }

          const totalTables = await Table.count({ where: { deleted: false } });
          console.log('Realtime check: reservedCount=', reservedCount, 'totalTables=', totalTables);
          if (reservedCount >= totalTables) {
            return res.status(409).json({ message: 'Hiện không có bàn trống vào thời gian này. Vui lòng chọn thời gian khác.' });
          }
        } catch (checkErr) {
          console.error('Lỗi khi kiểm tra trạng thái bàn:', checkErr);
          // don't block booking on check failure; proceed to controller which may have its own checks
        }

        req.body = {
          phoneNumber: functionArgs.phoneNumber,
          name: functionArgs.name,
          reservation_time: functionArgs.time,
          num_people: functionArgs.people,
        };
        console.log('Thông tin đặt bàn (after realtime checks):', req.body);

        const bookTableResult = await reservationController.bookTable(req, res);
        if (bookTableResult && bookTableResult.reservationId) {
          return res.status(200).json({
            message: `Đặt bàn thành công! Nhân viên của chúng tôi sẽ liên hệ với bạn qua số điện thoại ${functionArgs.phoneNumber} để xác nhận.`,
          });
        }
        return res.status(bookTableResult.status || 500).json({
          message: bookTableResult.message || 'Lỗi khi đặt bàn, vui lòng thử lại.',
        });
      } else if (name === 'getRestaurantInfo') {
        return handleRestaurantInfo(functionArgs, res);
      } else if (name === 'getMenu') {
        return handleMenuRequest(functionArgs, res);
      } else if (name === 'getDishDetails') {
        return handleDishDetails(functionArgs, res);
      } else if (name === 'suggestDish') {
        return handleDishSuggestion(functionArgs, res);
      } else {
        return res.status(400).json({ message: 'Chức năng không được hỗ trợ.' });
      }
    } else if (response.text) {
      return res.status(200).json({ message: response.text });
    } else {
      return res.status(400).json({ message: 'Tôi không hiểu yêu cầu.' });
    }
  } catch (error) {
    console.error('Lỗi xử lý:', error.message);
    return res.status(500).json({ message: 'Có lỗi xảy ra: ' + error.message });
  }
};

// Helper function to handle restaurant info requests
async function handleRestaurantInfo(functionArgs, res) {
  const { infoType, value } = functionArgs;
  if (infoType === 'all') {
    const infoMessage = [
      'Thông tin nhà hàng:',
      `Địa chỉ: ${value.address}`,
      `Số điện thoại: ${value.phoneNumber}`,
      `Email: ${value.email}`,
      `Giờ mở cửa: ${value.openingHours}`,
      `Bản đồ: Xem bản đồ`,
    ].join('\n');
    return res.status(200).json({ message: infoMessage });
  } else if (infoType === 'address') {
    const addressMessage = `Địa chỉ: ${value.address}\nBản đồ: Xem bản đồ`;
    return res.status(200).json({ message: addressMessage });
  } else {
    const infoTypeMap = {
      phoneNumber: 'Số điện thoại',
      email: 'Email',
      openingHours: 'Giờ mở cửa',
    };
    const displayName = infoTypeMap[infoType] || infoType;
    return res.status(200).json({ message: `${displayName}: ${value}` });
  }
}

// Helper function to handle menu requests
async function handleMenuRequest(functionArgs, res) {
  const { category, maxPrice, lightDish, region, keyword } = functionArgs;
  try {
    const menuItems = await fetchAllMenuItems(category, maxPrice, lightDish, region, keyword);

    if (menuItems.length === 0) {
      const filterDesc = `${category ? `trong danh mục ${category}` : ''} ${maxPrice ? `giá dưới ${maxPrice.toLocaleString('vi-VN')} VNĐ` : ''} ${lightDish ? 'thanh đạm' : ''} ${region ? `thuộc ${region}` : ''} ${keyword ? `liên quan đến ${keyword}` : ''}`;
      return res.status(200).json({
        message: `Không có món nào ${filterDesc}.`,
      });
    }

    // Chọn ngẫu nhiên tối đa 3 món
    const shuffledItems = menuItems.sort(() => 0.5 - Math.random());
    const selectedItems = shuffledItems.slice(0, Math.min(3, menuItems.length));
    const filterDesc = `${lightDish ? 'thanh đạm' : region ? `thuộc ${region}` : category ? `trong danh mục ${category}` : keyword ? `liên quan đến ${keyword}` : 'ăn'}`;
    const menuMessage = `Chúng tôi đề xuất cho quý khách một số món ${filterDesc}:\n` +
      selectedItems
        .map(item => {
          const imageTag = isValidImageUrl(item.image)
            ? `<img src="${item.image}" alt="${item.name}" width="100" class="clickable-image" data-id="${item.id}">`
            : 'Chưa có ảnh';
          return `${item.name} (${parseFloat(item.price).toLocaleString('vi-VN')} VNĐ): ${item.description} <br>${imageTag}`;
        })
        .join('\n');
    return res.status(200).json({ message: menuMessage });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi khi lấy menu.' });
  }
}

// Helper function to handle dish details requests
async function handleDishDetails(functionArgs, res) {
  const { dishName, detailType } = functionArgs;
  try {
    const menuItems = await fetchAllMenuItems();
    const item = menuItems.find(item => item.name.toLowerCase() === dishName.toLowerCase());
    if (!item) {
      return res.status(400).json({ message: `Không tìm thấy món ${dishName}.` });
    }
    const detailMap = {
      description: `Mô tả món ${item.name}: ${item.description}`,
      price: `Giá món ${item.name}: ${parseFloat(item.price).toLocaleString('vi-VN')} VNĐ`,
    };
    return res.status(200).json({ message: detailMap[detailType] || 'Yêu cầu chi tiết không hợp lệ.' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi khi lấy chi tiết món.' });
  }
}

// Helper function to handle dish suggestion requests
async function handleDishSuggestion(functionArgs, res) {
  const { category, maxPrice, lightDish, region, keyword } = functionArgs;
    try {
        const menuItems = await fetchAllMenuItems(category, maxPrice, lightDish, region, keyword);
        if (menuItems.length === 0) {
        const filterDesc = `${category ? `trong danh mục ${category}` : ''} ${maxPrice ? `giá dưới ${maxPrice.toLocaleString('vi-VN')} VNĐ` : ''} ${lightDish ? 'thanh đạm' : ''} ${region ? `thuộc ${region}` : ''} ${keyword ? `liên quan đến ${keyword}` : ''}`;
        return res.status(400).json({
            message: `Không có món nào ${filterDesc} để gợi ý.`,
        });
        }
        // Chọn ngẫu nhiên tối đa 3 món
        const shuffledItems = menuItems.sort(() => 0.5 - Math.random());
        const selectedItems = shuffledItems.slice(0, Math.min(3, menuItems.length));
        const filterDesc = `${lightDish ? 'thanh đạm' : region ? `thuộc ${region}` : category ? `trong danh mục ${category}` : keyword ? `liên quan đến ${keyword}` : 'ăn'}`;
        const suggestionMessage = `Chúng tôi đề xuất cho quý khách một số món ${filterDesc}:\n` +
        selectedItems
            .map(item => {
            const imageTag = isValidImageUrl(item.image)
                ? `<img src="${item.image}" alt="${item.name}" width="100" class="clickable-image">`
                : 'Chưa có ảnh';
            return `${item.name} (${parseFloat(item.price).toLocaleString('vi-VN')} VNĐ): ${item.description} <br>${imageTag}`;
            })
            .join('\n');
        return res.status(200).json({ message: suggestionMessage });
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi khi gợi ý món ăn.' });
    }
}

// Diagnostic handler to test LLM connectivity
exports.testLLM = async (req, res) => {
  try {
    const keyPresent = !!process.env.GOOGLE_API_KEY;
    const modelEnv = process.env.GENERATIVE_MODEL || 'gemini-2.5-flash';
    if (!llm || !llm.model) {
      return res.status(500).json({ ok: false, message: 'LLM not initialized or model missing', keyPresent, model: modelEnv });
    }

    // Try a minimal call
    try {
      const sample = await llm.generate(['Ping: kiểm tra kết nối'], { functions: [] });
      return res.status(200).json({ ok: true, message: 'LLM reachable', keyPresent, model: modelEnv, sample });
    } catch (callErr) {
      console.error('LLM call error (diagnostic):', callErr && callErr.message ? callErr.message : callErr);
      return res.status(502).json({ ok: false, message: 'LLM call failed', error: String(callErr), keyPresent, model: modelEnv });
    }
  } catch (err) {
    console.error('Error in testLLM:', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
