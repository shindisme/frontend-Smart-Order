import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import optionService from '../../services/optionService';
import optionGroupService from '../../services/optionGroupService';
import ModalCRUOption from '../../components/Admin/Content/Modals/ModalCRU/ModalCRU.Option';
import ModalConfirm from '../../components/Admin/Content/Modals/ModalConfirmDelete/ModalConfirm';
import TableLayout from '../../components/Admin/Content/TableLayout/TableLayout';
import Pagination from "../../components/common/Pagination";
import TopBar from '../../components/Admin/Content/TopBar/TopBar';
import { searchMatch } from "../../utils/removeTonesUtil";
import { exportOptionToExcel } from "../../utils/exportExcelUtil";
import { useFetch } from '../../hooks/useFetch';

function OptionManage() {
    const { data: options, loading: loadingOptions, refetch: refetchOptions } = useFetch(optionService);
    const { data: groups, loading: loadingGroups } = useFetch(optionGroupService);

    // state
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [paginatedOptions, setPaginatedOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedOption, setSelectedOption] = useState(null);
    const [optionToDelete, setOptionToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showModalConfirm, setShowModalConfirm] = useState(false);
    const [mode, setMode] = useState('read');

    // filter
    useEffect(() => {
        let result = options;

        if (searchTerm) {
            result = result.filter(option =>
                searchMatch(option.name, searchTerm) ||
                searchMatch(option.group_name, searchTerm)
            );
        }

        if (filters.group_id) {
            result = result.filter(option => option.group_id === parseInt(filters.group_id));
        }

        setFilteredOptions(result);
        setCurrentPage(1);
    }, [searchTerm, filters, options]);

    // paginate
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedOptions(filteredOptions.slice(startIndex, endIndex));
    }, [filteredOptions, currentPage, itemsPerPage]);

    // handlers
    const handleSearch = (value) => setSearchTerm(value);
    const handleFilter = (filterValues) => setFilters(filterValues);

    const handleRefresh = () => {
        setSearchTerm('');
        setFilters({});
        setCurrentPage(1);
        refetchOptions();
    };

    const handleExportExcel = () => {
        const result = exportOptionToExcel(filteredOptions);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const filterOptions = [
        {
            label: 'Nhóm tùy chọn',
            field: 'group_id',
            type: 'select',
            options: groups.map(group => ({
                label: group.name,
                value: group.group_id
            }))
        }
    ];

    const handleSetCreate = () => {
        setMode('create');
        setSelectedOption(null);
        setShowModal(true);
    };

    const handleSetRead = (row) => {
        setMode('read');
        setSelectedOption(row.fullData);
        setShowModal(true);
    };

    const handleSetUpdate = (row) => {
        setMode('update');
        setSelectedOption(row.fullData);
        setShowModal(true);
    };

    const handleDelete = (row) => {
        setOptionToDelete(row.fullData);
        setShowModalConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!optionToDelete) return;

        try {
            const res = await optionService.delete(optionToDelete.option_id);
            toast.success(res.message);
            refetchOptions();
        } catch (err) {
            console.error('Lỗi xóa: ', err);
            toast.error(err.response?.data?.message || 'Lỗi khi xóa');
        } finally {
            setShowModalConfirm(false);
            setOptionToDelete(null);
        }
    };

    const handleCU = async (formData) => {
        try {
            if (mode === 'create') {
                const res = await optionService.insert(formData);
                toast.success(res.message);
            } else if (mode === 'update') {
                const res = await optionService.update(selectedOption.option_id, formData);
                toast.success(res.message);
            }

            refetchOptions();
            setShowModal(false);
        } catch (error) {
            console.error('Lỗi CU: ', error);
            toast.error(error.response?.data?.message || 'Có lỗi, vui lòng thử lại!');
        }
    };

    // Table
    const columns = [
        { name: 'STT', key: 'stt' },
        { name: 'Tên tùy chọn', key: 'name' },
        { name: 'Nhóm', key: 'group' },
        { name: 'Giá thêm', key: 'plus_price' },
    ];

    const data = paginatedOptions.map((option, index) => ({
        stt: (currentPage - 1) * itemsPerPage + index + 1,
        name: option.name,
        group: option.group_name || '—',
        plus_price: new Intl.NumberFormat('vi-VN').format(option.plus_price) + 'đ',
        fullData: option
    }));

    const totalPages = Math.ceil(filteredOptions.length / itemsPerPage);

    if (loadingOptions || loadingGroups) return <div>Đang tải...</div>;

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

            <h2 className="mb-4">Danh sách tùy chọn</h2>

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

            <ModalCRUOption
                show={showModal}
                mode={mode}
                groups={groups}
                data={selectedOption}
                onClose={() => setShowModal(false)}
                onSubmit={handleCU}
            />

            <ModalConfirm
                show={showModalConfirm}
                title='Xác nhận xóa tùy chọn'
                message={`Bạn có chắc muốn xóa '${optionToDelete?.name}'?`}
                onClose={() => setShowModalConfirm(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default OptionManage;
