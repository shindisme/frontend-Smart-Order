import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import optionGroupService from "../../services/optionGroupService";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import ModalConfirm from "../../components/Admin/Content/ModalConfirmDelete/ModalConfirm";
import ModalCRUOptionGroup from "../../components/Admin/Content/ModalCRU/ModalCRU.OptionGroup";
import TopBar from "../../components/Admin/Content/TopBar/TopBar";

function OptionGroupManage() {
    const [optionGroups, setOptionGroups] = useState([]);

    const [optionGroupToDelete, setOptionGroupToDelete] = useState(null);
    const [selectedOptionGroup, setSelectedOptionGroup] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [showModalConfirm, setShowModalConfirm] = useState(false);
    const [mode, setMode] = useState('read');

    // ! set mode modal
    const handleSetRead = (row) => {
        setMode('read');
        setSelectedOptionGroup(row.fullData);
        setShowModal(true);
    }
    const handleSetCreate = () => {
        setMode('create');
        setSelectedOptionGroup(null);
        setShowModal(true);
    }
    const handleSetUpdate = (row) => {
        setMode('update');
        setSelectedOptionGroup(row.fullData);
        setShowModal(true);
    }

    // ! hàm tạo or update
    const handleCU = async (data) => {
        try {
            if (mode === 'create') {
                await optionGroupService.insert(data);
            }
            else if (mode === 'update') {
                await optionGroupService.update(selectedOptionGroup.group_id, data);
            }

            const res = await optionGroupService.getAll();
            setOptionGroups(res.data);

            setShowModal(false);
        } catch (error) {
            console.log(error);
            toast.error("Có lỗi, vui lòng thử lại!");
        }
    }

    // ! hàm xóa
    const handleDelete = (row) => {
        setOptionGroupToDelete(row.fullData);
        setShowModalConfirm(true);
    };
    const handleConfirmDelete = async () => {
        try {
            const res = await optionGroupService.delete(optionGroupToDelete.group_id);
            toast.success(res.message);

            const newList = await optionGroupService.getAll();
            setOptionGroups(newList.data);
        } catch (err) {
            console.log('Lỗi xóa: ', err);
            toast.error('Lỗi khi xóa');
        } finally {
            setShowModalConfirm(false);
            setOptionGroupToDelete(null);
        }
    }

    const columns = [
        { name: "STT", key: 'stt' },
        { name: "Tên nhóm tùy chọn", key: 'name' }
    ];

    const data = optionGroups.map((oGroup, index) => ({
        stt: index + 1,
        name: oGroup.name,
        fullData: oGroup
    }));

    useEffect(() => {
        optionGroupService
            .getAll()
            .then(res => setOptionGroups(res.data));
    }, []);

    return (
        <>
            <div className="mb-5">
                <TopBar onAdd={handleSetCreate} />
            </div>

            <h2 className="mb-4">Danh sách nhóm tùy chọn</h2>

            <TableLayout
                columns={columns}
                data={data}
                onRead={handleSetRead}
                onUpdate={handleSetUpdate}
                onDelete={handleDelete}
            />

            <ModalCRUOptionGroup
                show={showModal}
                mode={mode}
                data={selectedOptionGroup}
                onClose={() => setShowModal(false)}
                onSubmit={handleCU}
            />
            <ModalConfirm
                show={showModalConfirm}
                title="Xác nhận xóa món"
                message={`Bạn có chắc muốn xóa "${optionGroupToDelete?.name}"?`}
                onClose={() => setShowModalConfirm(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default OptionGroupManage;
