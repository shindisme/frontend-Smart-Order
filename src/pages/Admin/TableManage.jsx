import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import tableService from '../../services/tableService.js';
import styles from './TableManage.module.css';
import {
    MdAdd,
    MdQrCode2,
    MdEdit,
    MdDelete,
    MdTableBar,
    MdOutlineTableRestaurant
} from 'react-icons/md';
import { BiSolidCircle } from 'react-icons/bi';
import ModalCRUTable from '../../components/Admin/Content/Modals/ModalCRU/ModalCRU.Table';
import ModalConfirm from '../../components/Admin/Content/Modals/ModalConfirmDelete/ModalConfirm.jsx';
import ModalQRCode from '../../components/Admin/Content/Modals/ModalQRCode/ModalQRCode.jsx';

function TableManage() {
    const [tables, setTables] = useState([]);
    const [filteredTables, setFilteredTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [tableToDelete, setTableToDelete] = useState(null);
    const [filterState, setFilterState] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [mode, setMode] = useState('create');

    const getStatusConfig = (state) => {
        const configs = {
            0: {
                label: 'Trống',
                color: '#10b981',
                bgColor: '#d1fae5',
                textColor: '#047857'
            },
            1: {
                label: 'Đang dùng',
                color: '#f59e0b',
                bgColor: '#fef3c7',
                textColor: '#d97706'
            }
        };
        return configs[state] || configs[0];
    };

    const filterButtons = [
        {
            value: 'all',
            label: 'Tất cả',
            icon: MdTableBar,
            count: tables.length
        },
        {
            value: 0,
            label: 'Trống',
            icon: BiSolidCircle,
            color: '#10b981',
            count: tables.filter(t => t.state === 0).length
        },
        {
            value: 1,
            label: 'Đang dùng',
            icon: BiSolidCircle,
            color: '#f59e0b',
            count: tables.filter(t => t.state === 1).length
        }
    ];

    useEffect(() => {
        if (filterState === 'all') {
            setFilteredTables(tables);
        } else {
            setFilteredTables(tables.filter(table => table.state === filterState));
        }
    }, [tables, filterState]);

    const handleFilter = (state) => {
        setFilterState(state);
    };

    const handleCreate = () => {
        setMode('create');
        setSelectedTable(null);
        setShowModal(true);
    };

    const handleEdit = (table) => {
        setMode('update');
        setSelectedTable(table);
        setShowModal(true);
    };

    const handleShowQR = (table) => {
        setSelectedTable(table);
        setShowQRModal(true);
    };

    const handleOpenDeleteModal = (table) => {
        setTableToDelete(table);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!tableToDelete) return;

        try {
            const res = await tableService.delete(tableToDelete.table_id);
            toast.success(res.message || 'Xóa bàn thành công');

            const result = await tableService.getAll();
            setTables(result);
            setFilterState('all');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Lỗi khi xóa bàn');
        } finally {
            setShowDeleteModal(false);
            setTableToDelete(null);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (mode === 'create') {
                const res = await tableService.create(formData);
                toast.success(res.message || 'Thêm bàn thành công');
            } else if (mode === 'update') {
                const res = await tableService.update(selectedTable.table_id, formData);
                toast.success(res.message || 'Cập nhật thành công');
            }

            const result = await tableService.getAll();
            setTables(result);
            setFilterState('all');
            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const fetchTables = async () => {
        try {
            const result = await tableService.getAll();
            setTables(result);
        } catch (error) {
            console.error(error);
            toast.error('Lỗi tải dữ liệu');
            setTables([]);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <h1 className={styles.title}>Quản lý bàn</h1>

                    <div className={styles.headerActions}>
                        <div className={styles.filterGroup}>
                            {filterButtons.map(btn => (
                                <button
                                    key={btn.value}
                                    className={`${styles.filterBtn} ${filterState === btn.value ? styles.active : ''}`}
                                    onClick={() => handleFilter(btn.value)}
                                    style={filterState === btn.value && btn.color ?
                                        { borderColor: btn.color, background: btn.color + '15' } : {}
                                    }
                                >
                                    <btn.icon size={18} style={{ color: btn.color }} />
                                    <span>{btn.label}</span>
                                    <span className={styles.filterCount}>{btn.count}</span>
                                </button>
                            ))}
                        </div>

                        <button className={styles.btnAdd} onClick={handleCreate}>
                            <MdAdd size={20} />
                            <span>Thêm bàn</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.tableGrid}>
                {filteredTables.map((table) => {
                    const status = getStatusConfig(table.state);
                    return (
                        <div
                            key={table.table_id}
                            className={`${styles.tableCard} ${table.state === 1 ? styles.occupied : styles.available}`}
                        >
                            <div
                                className={styles.tableIcon}
                                style={{ backgroundColor: status.bgColor }}
                            >
                                <MdOutlineTableRestaurant
                                    size={48}
                                    style={{ color: status.color }}
                                />
                            </div>

                            <div className={styles.tableInfo}>
                                <h3 className={styles.tableName}>{table.name}</h3>

                                <div
                                    className={styles.statusBadge}
                                    style={{
                                        backgroundColor: status.bgColor,
                                        color: status.textColor
                                    }}
                                >
                                    <BiSolidCircle size={8} />
                                    {status.label}
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => handleShowQR(table)}
                                >
                                    <MdQrCode2 size={18} />
                                </button>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => handleEdit(table)}
                                >
                                    <MdEdit size={18} />
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${styles.actionDelete}`}
                                    onClick={() => handleOpenDeleteModal(table)}
                                >
                                    <MdDelete size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ModalCRUTable
                show={showModal}
                mode={mode}
                data={selectedTable}
                tables={tables}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
            />

            <ModalQRCode
                show={showQRModal}
                table={selectedTable}
                onClose={() => setShowQRModal(false)}
            />

            <ModalConfirm
                show={showDeleteModal}
                title="Xác nhận xóa bàn"
                message={`Bạn có chắc muốn xóa "${tableToDelete?.name}" không?`}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

export default TableManage;
