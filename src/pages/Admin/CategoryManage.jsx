import { useEffect, useState } from "react";
import categoryService from "../../services/categoryService";
import TopBar from "../../components/Admin/Content/TopBar/TopBar";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import ModalCRUCategory from "../../components/Admin/Content/ModalCRU/ModalCRU.Category";
import { toast } from "react-toastify";
import ModalConfirm from "../../components/Admin/Content/ModalConfirmDelete/ModalConfirm";

function CategoryManage() {

    const [categories, setCategories] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mode, setMode] = useState("read");

    // ! Set mode modal
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

    // hàm tạo or update
    const handleCU = async (data) => {
        try {
            if (mode === "create") {
                await categoryService.insert(data);
            } else if (mode === "update") {
                await categoryService.update(selectedCategory.category_id, data);
            }

            const res = await categoryService.getAll();
            setCategories(res.data);

            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi, vui lòng thử lại!");
        }
    };

    // ! hàm xóa
    const handleOpenDeleteModal = (row) => {
        setCategoryToDelete(row.fullData);
        setShowDeleteConfirm(true);
    };
    const handleConfirmDelete = async () => {
        try {
            const res = await categoryService.delete(categoryToDelete.category_id);
            toast.success(res.message);

            const newList = await categoryService.getAll();
            setCategories(newList.data);
        } catch (err) {
            console.log('Lỗi xóa: ', err);
            toast.error('Lỗi khi xóa');
        } finally {
            showDeleteConfirm(false);
            setCategoryToDelete(null);
        }
    }

    const columns = [
        { name: "STT", key: "stt" },
        { name: "Tên danh mục", key: "name" },
    ];

    const data = categories.map((cate, index) => ({
        stt: index + 1,
        name: cate.name,
        fullData: cate
    }));

    useEffect(() => {
        categoryService.getAll().then(res => setCategories(res.data));
    }, []);

    return (
        <>
            <div className="mb-5">
                <TopBar onAdd={handleSetCreate} />
            </div>

            <h2 className="mb-4">Danh sách danh mục sản phẩm</h2>

            <TableLayout
                columns={columns}
                data={data}
                onRead={handleSetRead}
                onUpdate={handleSetUpdate}
                onDelete={handleOpenDeleteModal}
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
                title="Xác nhận xóa món"
                message={`Bạn có chắc muốn xóa "${categoryToDelete?.name}"?`}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default CategoryManage;
