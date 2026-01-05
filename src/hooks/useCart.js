// src/hooks/useCart.js

import { useState, useEffect } from 'react';
import { CartStorage } from '../utils/cartStorage';

export function useCart(tableId, expirationHours) {
    const [cart, setCart] = useState(() => CartStorage.getCart(tableId || '', expirationHours));

    useEffect(() => {
        if (!tableId) return;

        const savedCart = CartStorage.getCart(tableId, expirationHours);
        setCart(savedCart);

        // Tạo interval để kiểm tra định kỳ (mỗi 5 phút)
        const checkInterval = setInterval(() => {
            const currentCart = CartStorage.getCart(tableId, expirationHours);
            if (currentCart.length === 0 && cart.length > 0) {
                setCart([]);
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(checkInterval);
    }, [tableId, expirationHours]);

    // Save vào storage khi cart thay đổi
    useEffect(() => {
        if (tableId && cart.length >= 0) {
            CartStorage.setCart(tableId, cart);
        }
    }, [cart, tableId]);

    const addItem = (item) => {
        setCart(prev => [...prev, item]);
    };

    const removeItem = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index, newItem) => {
        setCart(prev => prev.map((item, i) => i === index ? newItem : item));
    };

    const clearCart = () => {
        setCart([]);
        if (tableId) {
            CartStorage.clearCart(tableId);
        }
    };

    const getTotalPrice = () => {
        return cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    };

    const getItemCount = () => {
        return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    };

    const getRemainingTime = () => {
        return CartStorage.getRemainingTime(tableId, expirationHours);
    };

    return {
        cart,
        setCart,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        getTotalPrice,
        getItemCount,
        getRemainingTime,
        isEmpty: cart.length === 0
    };
}
