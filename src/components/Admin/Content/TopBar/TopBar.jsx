import { useState } from "react";
import { Form, InputGroup, Modal, Button as BootstrapButton } from "react-bootstrap";
import { FaPlus, FaSearch, FaSyncAlt, FaFilter, FaTimes, FaFileExcel } from "react-icons/fa";
import Button from '@mui/material/Button';

function TopBar({ onSearch, onAdd, onRefresh, onExportExcel, filterOptions, onFilter }) {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showExportConfirm, setShowExportConfirm] = useState(false);
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        onSearch?.(value);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilter = () => {
        onFilter?.(filters);
        setShowFilterModal(false);
    };

    const handleResetFilter = () => {
        setFilters({});
        onFilter?.({});
    };

    const handleRefresh = () => {
        setSearchTerm('');
        setFilters({});
        onRefresh?.();
    };

    const handleExportClick = () => {
        setShowExportConfirm(true);
    };

    const handleConfirmExport = () => {
        setShowExportConfirm(false);
        onExportExcel?.();
    };

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '15px 20px',
                background: 'white',
                borderRadius: '8px'
            }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    {onAdd && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={onAdd}
                            startIcon={<FaPlus size={16} />}
                        >
                            Thêm
                        </Button>
                    )}

                    {onExportExcel && (
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleExportClick}
                            startIcon={<FaFileExcel size={16} />}
                        >
                            Xuất file
                        </Button>
                    )}
                </div>

                <div style={{ width: "40%" }}>
                    <InputGroup>
                        <InputGroup.Text>
                            <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        {searchTerm && (
                            <InputGroup.Text
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleSearchChange('')}
                            >
                                <FaTimes />
                            </InputGroup.Text>
                        )}
                    </InputGroup>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    {filterOptions && (
                        <Button
                            variant="outlined"
                            onClick={() => setShowFilterModal(true)}
                            startIcon={<FaFilter />}
                        >
                            Bộ lọc
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleRefresh}
                        startIcon={<FaSyncAlt />}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Modal Bộ lọc */}
            {filterOptions && (
                <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Bộ lọc</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {filterOptions.map((option, index) => (
                            <div key={index} style={{ marginBottom: 15 }}>
                                <Form.Label>{option.label}</Form.Label>
                                {option.type === 'select' ? (
                                    <Form.Select
                                        value={filters[option.field] || ''}
                                        onChange={(e) => handleFilterChange(option.field, e.target.value)}
                                    >
                                        <option value="">Tất cả</option>
                                        {option.options.map((opt, idx) => (
                                            <option key={idx} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    <Form.Control
                                        type="text"
                                        value={filters[option.field] || ''}
                                        onChange={(e) => handleFilterChange(option.field, e.target.value)}
                                        placeholder={option.placeholder}
                                    />
                                )}
                            </div>
                        ))}
                    </Modal.Body>
                    <Modal.Footer>
                        <BootstrapButton variant="secondary" onClick={handleResetFilter}>
                            Đặt lại
                        </BootstrapButton>
                        <BootstrapButton variant="primary" onClick={handleApplyFilter}>
                            Áp dụng
                        </BootstrapButton>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Modal xác nhận xuất file */}
            <Modal show={showExportConfirm} onHide={() => setShowExportConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xuất file</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <p>Bạn có chắc muốn xuất dữ liệu ra file Excel?</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <BootstrapButton variant="secondary" onClick={() => setShowExportConfirm(false)}>
                        Hủy
                    </BootstrapButton>
                    <BootstrapButton variant="primary" onClick={handleConfirmExport}>
                        OK
                    </BootstrapButton>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TopBar;
