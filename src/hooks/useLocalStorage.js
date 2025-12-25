import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {

    // Lấy giá trị từ localStorage khi component mount
    const [value, setValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Lỗi localstorage:', error);
            return initialValue;
        }
    });

    // save vào local khi value thay đổi
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Lỗi lưu vào local:', error);
        }
    }, [key, value]);

    return [value, setValue];
}

export default useLocalStorage;
