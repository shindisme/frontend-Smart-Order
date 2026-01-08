// src/utils/cartStorage.js

export const getSessionId = () => {
    const key = 'userSessionId';
    let sessionId = localStorage.getItem(key);

    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(key, sessionId);
    }

    return sessionId;
};

// ✅ THÊM: Quản lý danh sách order_id của user này
export const MyOrders = {
    // Lưu order_id vừa tạo
    addOrderId: (orderId) => {
        try {
            const key = 'myOrderIds';
            const existing = localStorage.getItem(key);
            const orderIds = existing ? JSON.parse(existing) : [];

            if (!orderIds.includes(orderId)) {
                orderIds.push(orderId);
                localStorage.setItem(key, JSON.stringify(orderIds));
            }
        } catch (error) {
            console.error('Lỗi addOrderId:', error);
        }
    },

    // Lấy danh sách order_id của mình
    getOrderIds: () => {
        try {
            const key = 'myOrderIds';
            const existing = localStorage.getItem(key);
            return existing ? JSON.parse(existing) : [];
        } catch (error) {
            console.error('Lỗi getOrderIds:', error);
            return [];
        }
    },

    // Xóa order_id (khi hủy)
    removeOrderId: (orderId) => {
        try {
            const key = 'myOrderIds';
            const existing = localStorage.getItem(key);
            const orderIds = existing ? JSON.parse(existing) : [];

            const filtered = orderIds.filter(id => id !== orderId);
            localStorage.setItem(key, JSON.stringify(filtered));
        } catch (error) {
            console.error('Lỗi removeOrderId:', error);
        }
    },

    // Xóa tất cả
    clearOrderIds: () => {
        try {
            localStorage.removeItem('myOrderIds');
        } catch (error) {
            console.error('Lỗi clearOrderIds:', error);
        }
    }
};

export const CartStorage = {
    getKey: () => 'guestCart',
    getTimestampKey: () => 'guestCart_timestamp',

    getCart: (expirationHours = 3) => {
        try {
            const key = CartStorage.getKey();
            const timestampKey = CartStorage.getTimestampKey();

            const cart = localStorage.getItem(key);
            const timestamp = localStorage.getItem(timestampKey);

            if (!cart) return [];

            if (timestamp) {
                const savedTime = parseInt(timestamp);
                const now = Date.now();
                const hoursPassed = (now - savedTime) / (1000 * 60 * 60);

                if (hoursPassed > expirationHours) {
                    CartStorage.clearCart();
                    return [];
                }
            }

            return JSON.parse(cart);
        } catch (error) {
            console.error('Lỗi getCart:', error);
            return [];
        }
    },

    setCart: (cart) => {
        try {
            const key = CartStorage.getKey();
            const timestampKey = CartStorage.getTimestampKey();

            localStorage.setItem(key, JSON.stringify(cart));
            localStorage.setItem(timestampKey, Date.now().toString());
        } catch (error) {
            console.error('Lỗi setCart:', error);
        }
    },

    clearCart: () => {
        try {
            const key = CartStorage.getKey();
            const timestampKey = CartStorage.getTimestampKey();

            localStorage.removeItem(key);
            localStorage.removeItem(timestampKey);
        } catch (error) {
            console.error('Lỗi clearCart:', error);
        }
    },

    clearAllCarts: () => {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('guestCart')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Lỗi clearAllCarts:', error);
        }
    },

    hasCart: () => {
        const key = CartStorage.getKey();
        return localStorage.getItem(key) !== null;
    },

    getRemainingTime: (expirationHours = 4) => {
        try {
            const timestampKey = CartStorage.getTimestampKey();
            const timestamp = localStorage.getItem(timestampKey);

            if (!timestamp) return 0;

            const savedTime = parseInt(timestamp);
            const now = Date.now();
            const minutesPassed = (now - savedTime) / (1000 * 60);
            const totalMinutes = expirationHours * 60;
            const remaining = totalMinutes - minutesPassed;

            return Math.max(0, Math.floor(remaining));
        } catch (error) {
            return 0;
        }
    }
};
