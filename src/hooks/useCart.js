import { useState, useEffect } from 'react';
import { CartStorage } from '../utils/cartStorage';

export function useCart(expirationHours = 4) {
    const [cart, setCart] = useState(() => CartStorage.getCart(expirationHours));

    useEffect(() => {
        const savedCart = CartStorage.getCart(expirationHours);
        setCart(savedCart);

        const checkInterval = setInterval(() => {
            const currentCart = CartStorage.getCart(expirationHours);
            if (currentCart.length === 0 && cart.length > 0) {
                setCart([]);
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(checkInterval);
    }, [expirationHours]);

    useEffect(() => {
        if (cart.length >= 0) {
            CartStorage.setCart(cart);
        }
    }, [cart]);

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
        CartStorage.clearCart();
    };

    const getTotalPrice = () => {
        return cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    };

    const getItemCount = () => {
        return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    };

    const getRemainingTime = () => {
        return CartStorage.getRemainingTime(expirationHours);
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
