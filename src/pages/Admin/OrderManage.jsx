import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';
import tableService from '../../services/tableService';
import styles from './OrderManage.module.css';
import {
    MdReceipt,
    MdRestaurant,
    MdAccessTime,
    MdRefresh,
    MdCircle
} from 'react-icons/md';
import ModalOrderDetail from '../../components/Admin/Content/Modals/ModalOrderDetail/ModalOrderDetail';

function OrderManage() {
    const [orders, setOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDetailModal, setShowDetailModal] = useState(false);

    const STATUS_CONFIG = {
        0: {
            label: 'Chờ xác nhận',
            color: '#f59e0b',
            bgColor: '#fef3c7',
            textColor: '#d97706',
            icon: MdAccessTime
        },
        1: {
            label: 'Đang làm',
            color: '#3b82f6',
            bgColor: '#dbeafe',
            textColor: '#1d4ed8',
            icon: MdRestaurant
        },
        2: {
            label: 'Hoàn thành',
            color: '#10b981',
            bgColor: '#d1fae5',
            textColor: '#047857',
            icon: MdReceipt
        }
    };

    const FILTER_BUTTONS = [
        { value: 'all', label: 'Tất cả', icon: MdReceipt },
        { value: 0, label: 'Chờ xác nhận', icon: MdCircle, color: '#f59e0b' },
        { value: 1, label: 'Đang làm', icon: MdCircle, color: '#3b82f6' },
        { value: 2, label: 'Hoàn thành', icon: MdCircle, color: '#10b981' }
    ];

    const fetchOrders = async () => {
        try {
            const result = await orderService.getAll();
            setOrders(result.data || result);
        } catch (error) {
            console.error('Lỗi', error);
            toast.error('Lỗi tải dữ liệu đơn hàng');
            setOrders([]);
        }
    };

    const fetchTables = async () => {
        try {
            const result = await tableService.getAll();
            setTables(result.data || result);
        } catch (error) {
            console.error('Lỗi: ', error);
            setTables([]);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchTables();

        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (filterStatus === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.state === filterStatus));
        }
    }, [orders, filterStatus]);

    const handleFilter = (status) => {
        setFilterStatus(status);
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const handleUpdateStatus = async (orderId, newState) => {
        try {
            const res = await orderService.updateState(orderId, newState);
            toast.success(res.message);
            fetchOrders();
        } catch (error) {
            console.error('Lỗi:', error);
            toast.error('Lỗi cập nhật trạng thái');
        }
    };

    const handleRefresh = () => {
        fetchOrders();
        toast.info('Đã làm mới dữ liệu');
    };

    const getTableName = (tableId) => {
        const table = tables.find(t => t.table_id === tableId);
        return table?.name ?? 'N/A';
    };

    const getOrderCount = (status) => {
        if (status === 'all') return orders.length;
        return orders.filter(o => o.state === status).length;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <h1 className={styles.title}>Quản lý đơn hàng</h1>

                    <div className={styles.headerActions}>
                        <div className={styles.filterGroup}>
                            {FILTER_BUTTONS.map(btn => (
                                <button
                                    key={btn.value}
                                    className={`${styles.filterBtn} ${filterStatus === btn.value ? styles.active : ''}`}
                                    onClick={() => handleFilter(btn.value)}
                                    style={filterStatus === btn.value && btn.color
                                        ? { borderColor: btn.color, background: btn.color + '15' }
                                        : {}
                                    }
                                >
                                    <btn.icon size={18} style={{ color: btn.color }} />
                                    <span>{btn.label}</span>
                                    <span className={styles.filterCount}>{getOrderCount(btn.value)}</span>
                                </button>
                            ))}
                        </div>

                        <button className={styles.btnRefresh} onClick={handleRefresh}>
                            <MdRefresh size={20} />
                            <span>Làm mới</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.orderGrid}>
                {filteredOrders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MdReceipt size={64} color="#cbd5e1" />
                        <p>Không có đơn hàng nào</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const status = STATUS_CONFIG[order.state];
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={order.order_id}
                                className={styles.orderCard}
                                onClick={() => handleViewDetail(order)}
                                style={{ borderColor: status.bgColor }}
                            >
                                <div className={styles.orderHeader}>
                                    <div
                                        className={styles.orderIcon}
                                        style={{ backgroundColor: status.bgColor }}
                                    >
                                        <StatusIcon size={24} style={{ color: status.color }} />
                                    </div>
                                    <div className={styles.orderHeaderInfo}>
                                        <h3 className={styles.orderCode}>
                                            #{order.order_id.slice(0, 13).toUpperCase()}
                                        </h3>
                                        <p className={styles.orderTable}>
                                            Bàn: {getTableName(order.table_id)}
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.orderBody}>
                                    <div className={styles.orderTime}>
                                        <MdAccessTime size={14} />
                                        <span>{new Date(order.created_at).toLocaleString('vi-VN')}</span>
                                    </div>

                                    {order.note && (
                                        <div className={styles.orderNote}>
                                            Ghi chú: {order.note}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.orderFooter}>
                                    <div
                                        className={styles.statusBadge}
                                        style={{
                                            backgroundColor: status.bgColor,
                                            color: status.textColor
                                        }}
                                    >
                                        <MdCircle size={8} />
                                        {status.label}
                                    </div>

                                    {order.state < 2 && (
                                        <button
                                            className={styles.btnNext}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateStatus(order.order_id, order.state + 1);
                                            }}
                                            style={{ backgroundColor: status.color }}
                                        >
                                            {order.state === 0 ? 'Xác nhận' : 'Hoàn thành'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <ModalOrderDetail
                show={showDetailModal}
                order={selectedOrder}
                tables={tables}
                onClose={() => setShowDetailModal(false)}
                onUpdateStatus={handleUpdateStatus}
                onRefresh={fetchOrders}
            />
        </div>
    );
}

export default OrderManage;
