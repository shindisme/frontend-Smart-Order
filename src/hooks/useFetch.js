import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export function useFetch(service, dep = []) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await service.getAll();
            setData(result.data || result);
        } catch (err) {
            console.error('Lỗi fetch:', err);
            setError(err);
            toast.error('Lỗi tải dữ liệu');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, dep);

    return { data, loading, error, refetch: fetchData };
}
