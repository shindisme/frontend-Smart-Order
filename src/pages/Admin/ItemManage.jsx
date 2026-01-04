import { useEffect, useState } from "react";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import TopBar from "../../components/Admin/Content/TopBar/TopBar";
import Pagination from "../../components/common/Pagination";
import itemService from '../../services/itemService';
import categoryService from "../../services/categoryService";
import optionGroupService from "../../services/optionGroupService";
import ModalCRUItem from "../../components/Admin/Content/Modals/ModalCRU/ModalCRU.Item";
import ModalConfirm from "../../components/Admin/Content/Modals/ModalConfirmDelete/ModalConfirm";
import { toast } from "react-toastify";
import { searchMatch } from "../../utils/removeTonesUtil";
import { exportItemsToExcel } from "../../utils/exportExcelUtil";
import { useFetch } from "../../hooks/useFetch";

function ItemManage() {
    const { data: items, loading: loadingItems, refetch: refetchItems } = useFetch(itemService);
    const { data: categories, loading: loadingCategories } = useFetch(categoryService);
    const { data: groups, loading: loadingGroups } = useFetch(optionGroupService);

    const [filteredItems, setFilteredItems] = useState([]);
    const [paginatedItems, setPaginatedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mode, setMode] = useState("read");

    // filter
    useEffect(() => {
        let result = items;

        if (searchTerm) {
            result = result.filter(item =>
                searchMatch(item.name, searchTerm) ||
                searchMatch(item.category_name, searchTerm)
            );
        }

        if (filters.category_id) {
            result = result.filter(item => item.category_id == filters.category_id);
        }

        if (filters.is_available !== undefined && filters.is_available !== '') {
            const isAvailable = filters.is_available === '1' || filters.is_available === 1;
            result = result.filter(item => item.is_available === (isAvailable ? 1 : 0));
        }

        setFilteredItems(result);
        setCurrentPage(1);
    }, [searchTerm, filters, items]);

    // paginate
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedItems(filteredItems.slice(startIndex, endIndex));
    }, [filteredItems, currentPage, itemsPerPage]);

    const handleSearch = (value) => setSearchTerm(value);
    const handleFilter = (filterValues) => setFilters(filterValues);

    const handleRefresh = () => {
        setSearchTerm('');
        setFilters({});
        setCurrentPage(1);
        refetchItems();
    };

    const handleExportExcel = () => {
        const result = exportItemsToExcel(filteredItems);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const filterOptions = [
        {
            label: 'Danh mục',
            field: 'category_id',
            type: 'select',
            options: categories.map(cat => ({
                label: cat.name,
                value: cat.category_id
            }))
        },
        {
            label: 'Trạng thái',
            field: 'is_available',
            type: 'select',
            options: [
                { label: 'Còn hàng', value: '1' },
                { label: 'Hết hàng', value: '0' }
            ]
        }
    ];

    const handleSetCreate = () => {
        setMode("create");
        setSelectedItem(null);
        setShowModal(true);
    };

    const handleSetRead = (row) => {
        setMode("read");
        setSelectedItem(row.fullData);
        setShowModal(true);
    };

    const handleSetUpdate = (row) => {
        setMode("update");
        setSelectedItem(row.fullData);
        setShowModal(true);
    };

    const handleOpenDeleteModal = (row) => {
        setItemToDelete(row.fullData);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const res = await itemService.delete(itemToDelete.item_id);
            toast.success(res.message);
            refetchItems();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi khi xóa");
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleCU = async (formData) => {
        try {
            if (mode === "create") {
                const res = await itemService.insert(formData);
                toast.success(res.message);
            } else if (mode === "update") {
                const res = await itemService.update(selectedItem.item_id, formData);
                toast.success(res.message);
            }

            refetchItems();
            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    // Table
    const columns = [
        { name: "STT", key: "stt" },
        { name: "Tên món", key: "name" },
        { name: "Loại", key: "category" },
        { name: "Giá", key: "price" },
        { name: "Trạng thái", key: "status" },
        { name: "Ảnh", key: "img" },
    ];

    const itemData = paginatedItems.map((item, index) => ({
        stt: (currentPage - 1) * itemsPerPage + index + 1,
        name: item.name,
        category: item.category_name,
        price: new Intl.NumberFormat('vi-VN').format(item.price) + "đ",
        status: item.is_available ? (
            <span className="badge bg-success">Còn</span>
        ) : (
            <span className="badge bg-danger">Hết</span>
        ),
        img: (
            <img
                src={`${import.meta.env.VITE_IMG_URL}${item.img}`}
                alt={item.name}
                width="50"
                style={{ borderRadius: '4px' }}
            />
        ),
        fullData: item
    }));

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    if (loadingItems || loadingCategories || loadingGroups) return <div>Đang tải...</div>;

    return (
        <>
            <TopBar
                onAdd={handleSetCreate}
                onSearch={handleSearch}
                onRefresh={handleRefresh}
                onExportExcel={handleExportExcel}
                filterOptions={filterOptions}
                onFilter={handleFilter}
            />

            <TableLayout
                columns={columns}
                data={itemData}
                onRead={handleSetRead}
                onUpdate={handleSetUpdate}
                onDelete={handleOpenDeleteModal}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
            />

            <ModalCRUItem
                show={showModal}
                mode={mode}
                categories={categories}
                groups={groups}
                data={selectedItem}
                onClose={() => setShowModal(false)}
                onSubmit={handleCU}
            />

            <ModalConfirm
                show={showDeleteModal}
                title="Xác nhận xóa món"
                message={`Bạn có chắc muốn xóa "${itemToDelete?.name}"?`}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default ItemManage;
