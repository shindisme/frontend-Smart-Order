import { DropdownButton, Dropdown, Form, InputGroup } from "react-bootstrap";
import { FaPlus, FaSearch, FaSyncAlt, FaFilter } from "react-icons/fa";
import Button from '@mui/material/Button';

function TopBar({ onSearch, onAdd }) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
            padding: '10px 20px '
        }}>
            <div style={{ display: 'flex', gap: 10 }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={onAdd}
                >
                    <FaPlus className="me-2" />Thêm
                </Button>

                <DropdownButton id='dropdown-export' variant="outline-primary" title="Xuất file">
                    <Dropdown.Item href="#">File PDF</Dropdown.Item>
                    <Dropdown.Item href="#">File Excel</Dropdown.Item>
                </DropdownButton>
            </div >

            {/*  search */}
            <div style={{ width: "40%" }}>
                <InputGroup>
                    <InputGroup.Text>
                        <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Tìm kiếm..."
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                </InputGroup>
            </div >

            <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="outline-primary">
                    <FaFilter className="me-2" />Bộ lọc
                </Button>
                <Button variant="outline-secondary">
                    <FaSyncAlt className="me-2" />Làm mới
                </Button>
            </div >
        </div >
    );
}

export default TopBar;
