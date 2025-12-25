/**
 * Order Service - Mock API
 * 
 * Service này cung cấp các method để làm việc với đơn hàng
 * Hiện tại dùng mock data, sau này sẽ thay bằng API thật
 */

// Mock data - Dữ liệu giả để test
const mockOrderData = {
    items: [
        {
            id: 1,
            name: "Mì cay abczzzzz",
            quantity: 1,
            price: 40000,
            image: "/images/mi-cay.jpg", // Đường dẫn ảnh
            customization: "Ít cay, nhiều mì", // Ghi chú tùy chỉnh
            options: [
                { name: "Ít cay", price: 0 },
                { name: "Nhiều mì", price: 0 }
            ]
        },
        {
            id: 2,
            name: "Matcha",
            quantity: 2,
            price: 40000,
            image: "/images/matcha.jpg",
            customization: "Đường bình thường (100% đường)",
            options: [
                { name: "Đường bình thường", price: 0 }
            ]
        },
        {
            id: 3,
            name: "Socola đá xay",
            quantity: 1,
            price: 40000,
            image: "/images/socola.jpg",
            customization: "Ít đá (50% đá)",
            options: [
                { name: "Ít đá", price: 0 }
            ]
        }
    ],
    voucher: {
        code: "KHUYENMAI15",
        discount: 15000,
        applied: true
    },
    totalItems: 4, // Tổng số món
    subtotal: 120000, // Tổng giá món
    discount: 15000, // Giảm giá
    total: 105000 // Tổng thanh toán
};

const orderService = {
    /**
     * Lấy thông tin đơn hàng hiện tại (mock)
     * @returns {Promise} Promise với dữ liệu đơn hàng
     */
    getCurrentOrder() {
        // Mock API call - giả lập delay như API thật
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: mockOrderData,
                    message: "Lấy đơn hàng thành công"
                });
            }, 500); // Delay 500ms để giống API thật
        });
    },

    /**
     * Áp dụng voucher
     * @param {string} code - Mã voucher
     * @returns {Promise} Promise với thông tin voucher
     */
    applyVoucher(code) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (code === "KHUYENMAI15") {
                    resolve({
                        data: {
                            code: "KHUYENMAI15",
                            discount: 15000,
                            message: "Áp dụng voucher thành công"
                        }
                    });
                } else {
                    reject({
                        message: "Mã voucher không hợp lệ"
                    });
                }
            }, 500);
        });
    },

    /**
     * Đặt đơn hàng
     * @param {Object} orderData - Dữ liệu đơn hàng
     * @returns {Promise} Promise với kết quả đặt hàng
     */
    placeOrder(orderData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        orderId: Math.floor(Math.random() * 1000000),
                        ...orderData
                    },
                    message: "Đặt đơn hàng thành công"
                });
            }, 1000);
        });
    },

    /**
     * Lấy danh sách phương thức thanh toán
     * @returns {Promise} Promise với danh sách payment methods
     */
    getPaymentMethods() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: [
                        { id: 1, name: "Ngân hàng", icon: "🏦" },
                        { id: 2, name: "Ví điện tử", icon: "💳" },
                        { id: 3, name: "Tiền mặt", icon: "💵" }
                    ]
                });
            }, 300);
        });
    }
};

export default orderService;
