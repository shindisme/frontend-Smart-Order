import { useEffect, useState } from "react";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import TopBar from "../../components/Admin/Content/TopBar/TopBar";
import itemService from '../../services/itemService';
import categoryService from "../../services/categoryService";
import optionGroupService from "../../services/optionGroupService"
import ModalCRUItem from "../../components/Admin/Content/ModalCRU/ModalCRU.Item";
import { toast } from "react-toastify";
import ModalConfirm from "../../components/Admin/Content/ModalConfirmDelete/ModalConfirm";

function ItemManage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);

    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mode, setMode] = useState("read");

    // ! set mode modal
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

    //! hàm xóa 
    const handleOpenDeleteModal = (row) => {
        setItemToDelete(row.fullData);
        setShowDeleteModal(true);
    };
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const res = await itemService.delete(itemToDelete.item_id);
            toast.success(res.message);

            const items = await itemService.getAll();
            setItems(items);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi khi xóa");
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    // !tạo or update
    const handleCU = async (formData) => {
        try {
            if (mode === "create") {
                const res = await itemService.insert(formData);
                toast.success(res.message);
            }
            else if (mode === "update") {
                const res = await itemService.update(selectedItem.item_id, formData);
                toast.success(res.message);
            }

            const items = await itemService.getAll();
            setItems(items);

            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const columns = [
        { name: "STT", key: "stt" },
        { name: "Tên món", key: "name" },
        { name: "Loại", key: "category" },
        { name: "Giá", key: "price" },
        { name: "Trạng thái", key: "status" },
        { name: "Ảnh", key: "img" },
    ];
    const itemData = items.map((item, index) => ({
        stt: index + 1,
        name: item.name,
        category: item.category_name,
        price: item.price + "đ",
        status: item.is_available ? "Còn" : "Hết",
        img: (
            <img
                src={`${import.meta.env.VITE_IMG_URL}${item.img}`}
                alt="Hình ảnh"
                width="50"
            />
        ),
        fullData: item
    }));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const items = await itemService.getAll();
                const categories = await categoryService.getAll();
                const groups = await optionGroupService.getAll();

                setItems(items);
                setCategories(categories);
                setGroups(groups.data);
            } catch (error) {
                console.error("Lỗi:", error);
                toast.error("Lỗi tải dữ liệu");
                setItems([]);
                setCategories([]);
                setGroups([]);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <div className="mb-5">
                <TopBar onAdd={handleSetCreate} />
            </div>

            <TableLayout
                columns={columns}
                data={itemData}
                onRead={handleSetRead}
                onUpdate={handleSetUpdate}
                onDelete={handleOpenDeleteModal}
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
