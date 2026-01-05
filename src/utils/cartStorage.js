export const CartStorage = {
    // Tạo key theo tableId
    getKey: (tableId) => `guestCart_${tableId}`,
    getTimestampKey: (tableId) => `guestCart_${tableId}_timestamp`,

    // Lấy giỏ hàng (kiểm tra thời gian)
    getCart: (tableId, expirationHours = 4) => {
        try {
            const key = CartStorage.getKey(tableId);
            const timestampKey = CartStorage.getTimestampKey(tableId);

            const cart = localStorage.getItem(key);
            const timestamp = localStorage.getItem(timestampKey);

            if (!cart) return [];

            // Kiểm tra time
            if (timestamp) {
                const savedTime = parseInt(timestamp);
                const now = Date.now();
                const hoursPassed = (now - savedTime) / (1000 * 60 * 60);

                if (hoursPassed > expirationHours) {
                    CartStorage.clearCart(tableId);
                    return [];
                }
            }

            return JSON.parse(cart);
        } catch (error) {
            console.error('Lỗi', error);
            return [];
        }
    },

    // Lưu giỏ hàng
    setCart: (tableId, cart) => {
        try {
            const key = CartStorage.getKey(tableId);
            const timestampKey = CartStorage.getTimestampKey(tableId);

            localStorage.setItem(key, JSON.stringify(cart));
            localStorage.setItem(timestampKey, Date.now().toString());
        } catch (error) {
            console.error('Lỗi:', error);
        }
    },

    // Xóa giỏ hàng theo table
    clearCart: (tableId) => {
        try {
            const key = CartStorage.getKey(tableId);
            const timestampKey = CartStorage.getTimestampKey(tableId);

            localStorage.removeItem(key);
            localStorage.removeItem(timestampKey);
        } catch (error) {
            console.error('Lỗi', error);
        }
    },

    // Xóa tất cả giỏ hàng cũ
    clearAllCarts: () => {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('guestCart_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Lỗi', error);
        }
    },

    // Kiểm tra có cart không
    hasCart: (tableId) => {
        const key = CartStorage.getKey(tableId);
        return localStorage.getItem(key) !== null;
    },

    // Lấy thời gian còn lại (phút)
    getRemainingTime: (tableId, expirationHours = 4) => {
        try {
            const timestampKey = CartStorage.getTimestampKey(tableId);
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
