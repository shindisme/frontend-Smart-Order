import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import optionService from '../../services/optionService';
import optionGroupService from '../../services/optionGroupService';
import ModalCRUOption from '../../components/Admin/Content/ModalCRU/ModalCRU.Option';
import ModalConfirm from '../../components/Admin/Content/ModalConfirmDelete/ModalConfirm';
import TableLayout from '../../components/Admin/Content/TableLayout/TableLayout';
import TopBar from '../../components/Admin/Content/TopBar/TopBar';

function OptionManage() {
    const [options, setOptions] = useState([]);
    const [groups, setGroups] = useState([]);

    const [selectedOption, setSelectedOption] = useState(null);
    const [optionToDelete, setOptionToDelete] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [showModalConfirm, setShowModalConfirm] = useState(false);
    const [mode, setMode] = useState('read');

    // ! set mode modal
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

    //! hàm xóa 
    const handleDelete = (row) => {
        setOptionToDelete(row.fullData);
        setShowModalConfirm(true);
    };
    const handleConfirmDelete = async () => {
        if (!optionToDelete) return;

        try {
            const res = await optionService.delete(optionService.item_id);

            toast.success(res.message);

            const newList = await optionService.getAll();
            setOptions(newList.data);
        } catch (err) {
            console.log('Lỗi xóa: ', err);
            toast.error('Lỗi khi xóa');
        } finally {
            setShowModalConfirm(false);
            setOptionToDelete(null);
        }
    };

    // !tạo or update
    const handleCU = async (formData) => {
        try {
            if (mode === 'create') {
                await optionService.insert(formData);
                toast.success('Thêm sản phẩm thành công!');
            }
            else if (mode === 'update') {
                await optionService.update(selectedOption.option_id, formData);
                toast.success('Cập nhật sản phẩm thành công!');
            }

            const res = await optionService.getAll();
            setOptions(res.data);

            setShowModal(false);
        } catch (error) {
            console.error('Lỗi CU: ', error);
            toast.error('Có lỗi, vui lòng thử lại!');
        }
    };

    const columns = [
        { name: 'STT', key: 'stt' },
        { name: 'Tên tùy chọn', key: 'name' },
        { name: 'Nhóm', key: 'group' },
        { name: 'Giá thêm', key: 'plus_price' },
    ];

    const data = options.map((option, index) => ({
        stt: index + 1,
        name: option.name,
        group: option.group_name || '—',
        plus_price: option.plus_price + 'đ',
        fullData: option
    }));

    useEffect(() => {
        optionService.getAll().then(res => setOptions(res.data));
        optionGroupService.getAll().then(res => setGroups(res.data));
    }, []);

    return (
        <>
            <div className='mb-5'>
                <TopBar onAdd={handleSetCreate} />
            </div>

            <TableLayout
                columns={columns}
                data={data}
                onRead={handleSetRead}
                onUpdate={handleSetUpdate}
                onDelete={handleDelete}
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
                title='Xác nhận xóa món'
                message={`Bạn có chắc muốn xóa '${optionToDelete?.name}'?`}
                onClose={() => setShowModalConfirm(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default OptionManage;