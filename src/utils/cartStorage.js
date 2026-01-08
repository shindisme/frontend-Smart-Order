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
            console.error('Lỗi:', error);
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
            console.error('Lỗi:', error);
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
