import { useEffect, useState } from "react";
import categoryService from "../../services/categoryService";
import TopBar from "../../components/Admin/Content/TopBar/TopBar";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import Pagination from "../../components/common/Pagination";
import ModalCRUCategory from "../../components/Admin/Content/Modals/ModalCRU/ModalCRU.Category";
import ModalConfirm from "../../components/Admin/Content/Modals/ModalConfirmDelete/ModalConfirm";
import { toast } from "react-toastify";
import { searchMatch } from "../../utils/removeTonesUtil";
import { exportCategoryToExcel } from "../../utils/exportExcelUtil";
import { useFetch } from "../../hooks/useFetch";

function CategoryManage() {
    const { data: categories, loading, refetch } = useFetch(categoryService);

    const [filteredCategories, setFilteredCategories] = useState([]);
    const [paginatedCategories, setPaginatedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mode, setMode] = useState("read");

    // Filter
    useEffect(() => {
        let result = categories;

        if (searchTerm) {
            result = result.filter(cat => searchMatch(cat.name, searchTerm));
        }

        setFilteredCategories(result);
        setCurrentPage(1);
    }, [searchTerm, categories]);

    // Paginate
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedCategories(filteredCategories.slice(startIndex, endIndex));
    }, [filteredCategories, currentPage, itemsPerPage]);

    // Handlers
    const handleSearch = (value) => setSearchTerm(value);

    const handleRefresh = () => {
        setSearchTerm('');
        setCurrentPage(1);
        refetch();
    };

    const handleExportExcel = () => {
        const result = exportCategoryToExcel(filteredCategories);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const handleSetCreate = () => {
        setMode("create");
        setSelectedCategory(null);
        setShowModal(true);
    };

    const handleSetRead = (row) => {
        setMode("read");
        setSelectedCategory(row.fullData);
        setShowModal(true);
    };

    const handleSetUpdate = (row) => {
        setMode("update");
        setSelectedCategory(row.fullData);
        setShowModal(true);
    };

    const handleCU = async (data) => {
        try {
            if (mode === "create") {
                const res = await categoryService.insert(data);
                toast.success(res.message);
            } else if (mode === "update") {
                const res = await categoryService.update(selectedCategory.category_id, data);
                toast.success(res.message);
            }

            refetch();
            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleOpenDeleteModal = (row) => {
        setCategoryToDelete(row.fullData);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const res = await categoryService.delete(categoryToDelete.category_id);
            toast.success(res.message);
            refetch();
        } catch (err) {
            console.error('Lỗi xóa: ', err);
            toast.error('Lỗi khi xóa');
        } finally {
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
        }
    };

    // Table
    const columns = [
        { name: "STT", key: "stt" },
        { name: "Tên danh mục", key: "name" },
    ];

    const data = paginatedCategories.map((cate, index) => ({
        stt: (currentPage - 1) * itemsPerPage + index + 1,
        name: cate.name,
        fullData: cate
    }));

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    if (loading) return <div>Đang tải...</div>;

    return (
        <>
            <TopBar
                onAdd={handleSetCreate}
                onSearch={handleSearch}
                onRefresh={handleRefresh}
                onExportExcel={handleExportExcel}
            />

            <h2 className="mb-4">Danh sách danh mục sản phẩm</h2>

            <TableLayout
                columns={columns}
                data={data}
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

            <ModalCRUCategory
                show={showModal}
                mode={mode}
                data={selectedCategory}
                onClose={() => setShowModal(false)}
                onSubmit={handleCU}
            />

            <ModalConfirm
                show={showDeleteConfirm}
                title="Xác nhận xóa danh mục"
                message={`Bạn có chắc muốn xóa "${categoryToDelete?.name}"?`}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default CategoryManage;
