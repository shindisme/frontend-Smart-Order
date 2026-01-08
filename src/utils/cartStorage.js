export const getSessionId = () => {
    const key = 'userSessionId';
    let sessionId = localStorage.getItem(key);

    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(key, sessionId);
    }

    return sessionId;
};

export const MyOrders = {
    addOrderId: (orderId) => {
        try {
            const key = 'myOrderIds';
            const timestampKey = 'orderTimestamps';

            const existing = localStorage.getItem(key);
            const orderIds = existing ? JSON.parse(existing) : [];

            const timestamps = JSON.parse(localStorage.getItem(timestampKey) || '{}');

            if (!orderIds.includes(orderId)) {
                orderIds.push(orderId);
                timestamps[orderId] = Date.now();

                localStorage.setItem(key, JSON.stringify(orderIds));
                localStorage.setItem(timestampKey, JSON.stringify(timestamps));

            }
        } catch (error) {
            console.error('Lỗi:', error);
        }
    },

    getOrderIds: () => {
        try {
            MyOrders.cleanOldOrders();

            const key = 'myOrderIds';
            const existing = localStorage.getItem(key);
            return existing ? JSON.parse(existing) : [];
        } catch (error) {
            console.error('Lỗi:', error);
            return [];
        }
    },

    cleanOldOrders: () => {
        try {
            const key = 'myOrderIds';
            const timestampKey = 'orderTimestamps';

            const orderIds = JSON.parse(localStorage.getItem(key) || '[]');
            const timestamps = JSON.parse(localStorage.getItem(timestampKey) || '{}');

            const now = Date.now();
            const twoHours = 2 * 60 * 60 * 1000;

            const validOrderIds = orderIds.filter(orderId => {
                const timestamp = timestamps[orderId];
                if (!timestamp) return false;

                const age = now - timestamp;
                return age < twoHours;
            });

            const validTimestamps = {};
            validOrderIds.forEach(orderId => {
                if (timestamps[orderId]) {
                    validTimestamps[orderId] = timestamps[orderId];
                }
            });

            localStorage.setItem(key, JSON.stringify(validOrderIds));
            localStorage.setItem(timestampKey, JSON.stringify(validTimestamps));

        } catch (error) {
            console.error('Lỗi:', error);
        }
    },

    removeOrderId: (orderId) => {
        try {
            const key = 'myOrderIds';
            const timestampKey = 'orderTimestamps';

            const existing = localStorage.getItem(key);
            const orderIds = existing ? JSON.parse(existing) : [];

            const timestamps = JSON.parse(localStorage.getItem(timestampKey) || '{}');

            const filtered = orderIds.filter(id => id !== orderId);
            delete timestamps[orderId];

            localStorage.setItem(key, JSON.stringify(filtered));
            localStorage.setItem(timestampKey, JSON.stringify(timestamps));
        } catch (error) {
            console.error('Lỗi:', error);
        }
    },

    clearOrderIds: () => {
        try {
            localStorage.removeItem('myOrderIds');
            localStorage.removeItem('orderTimestamps');
        } catch (error) {
            console.error('Lỗi:', error);
        }
    },

    getRemainingTime: (orderId) => {
        try {
            const timestampKey = 'orderTimestamps';
            const timestamps = JSON.parse(localStorage.getItem(timestampKey) || '{}');

            const timestamp = timestamps[orderId];
            if (!timestamp) return 0;

            const now = Date.now();
            const twoHours = 2 * 60 * 60 * 1000;
            const age = now - timestamp;
            const remaining = twoHours - age;

            return Math.max(0, Math.floor(remaining / 1000 / 60));
        } catch (error) {
            return 0;
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
            console.error('Lỗi:', error);
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
            console.error('Lỗi:', error);
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
