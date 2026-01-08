import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import optionGroupService from "../../services/optionGroupService";
import TableLayout from "../../components/Admin/Content/TableLayout/TableLayout";
import Pagination from "../../components/common/Pagination";
import ModalConfirm from "../../components/Admin/Content/Modals/ModalConfirmDelete/ModalConfirm";
import ModalCRUOptionGroup from "../../components/Admin/Content/Modals/ModalCRU/ModalCRU.OptionGroup";
import TopBar from "../../components/Admin/Content/TopBar/TopBar";
import { searchMatch } from "../../utils/removeTonesUtil";
import { exportOptionGroupToExcel } from "../../utils/exportExcelUtil";
import { useFetch } from "../../hooks/useFetch";

function OptionGroupManage() {
    const { data: optionGroups, loading, refetch } = useFetch(optionGroupService);

    // State
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [paginatedGroups, setPaginatedGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [optionGroupToDelete, setOptionGroupToDelete] = useState(null);
    const [selectedOptionGroup, setSelectedOptionGroup] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showModalConfirm, setShowModalConfirm] = useState(false);
    const [mode, setMode] = useState('read');

    // Filter
    useEffect(() => {
        let result = optionGroups;

        if (searchTerm) {
            result = result.filter(group => searchMatch(group.name, searchTerm));
        }

        setFilteredGroups(result);
        setCurrentPage(1);
    }, [searchTerm, optionGroups]);

    // Paginate
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedGroups(filteredGroups.slice(startIndex, endIndex));
    }, [filteredGroups, currentPage, itemsPerPage]);

    // Handlers
    const handleSearch = (value) => setSearchTerm(value);

    const handleRefresh = () => {
        setSearchTerm('');
        setCurrentPage(1);
        refetch();
    };

    const handleExportExcel = () => {
        const result = exportOptionGroupToExcel(filteredGroups);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const handleSetRead = (row) => {
        setMode('read');
        setSelectedOptionGroup(row.fullData);
        setShowModal(true);
    };

    const handleSetCreate = () => {
        setMode('create');
        setSelectedOptionGroup(null);
        setShowModal(true);
    };

    const handleSetUpdate = (row) => {
        setMode('update');
        setSelectedOptionGroup(row.fullData);
        setShowModal(true);
    };

    const handleCU = async (data) => {
        try {
            if (mode === 'create') {
                const res = await optionGroupService.insert(data);
                toast.success(res.message);
            } else if (mode === 'update') {
                const res = await optionGroupService.update(selectedOptionGroup.group_id, data);
                toast.success(res.message);
            }

            refetch();
            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Có lỗi, vui lòng thử lại!");
        }
    };

    const handleDelete = (row) => {
        setOptionGroupToDelete(row.fullData);
        setShowModalConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!optionGroupToDelete) return;

        try {
            const res = await optionGroupService.delete(optionGroupToDelete.group_id);
            toast.success(res.message);
            refetch();
        } catch (err) {
            console.error('Lỗi xóa: ', err);
            toast.error(err.response?.data?.message || 'Lỗi khi xóa');
        } finally {
            setShowModalConfirm(false);
            setOptionGroupToDelete(null);
        }
    };

    // Table
    const columns = [
        { name: "STT", key: 'stt' },
        { name: "Tên nhóm tùy chọn", key: 'name' }
    ];

    const data = paginatedGroups.map((oGroup, index) => ({
        stt: (currentPage - 1) * itemsPerPage + index + 1,
        name: oGroup.name,
        fullData: oGroup
    }));

    const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

    if (loading) return <div>Đang tải...</div>;

    return (
        <>
            <TopBar
                onAdd={handleSetCreate}
                onSearch={handleSearch}
                onRefresh={handleRefresh}
                onExportExcel={handleExportExcel}
            />

            <h2 className="mb-4">Danh sách nhóm tùy chọn</h2>

            <TableLayout
                columns={columns}
                data={data}
                onRead={handleSetRead}
                onUpdate={handleSetUpdate}
                onDelete={handleDelete}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
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
                title="Xác nhận xóa nhóm tùy chọn"
                message={`Bạn có chắc muốn xóa "${optionGroupToDelete?.name}"?`}
                onClose={() => setShowModalConfirm(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default OptionGroupManage;
