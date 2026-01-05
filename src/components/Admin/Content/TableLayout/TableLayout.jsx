import { Table } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { MdEdit, MdVpnKey } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { ButtonGroup, Button } from "@mui/material";

function TableLayout({ columns = [], data = [], onRead, onDelete, onUpdate, onResetPassword }) {
    const handleRead = (itemData) => onRead && onRead(itemData);
    const handleUpdate = (itemData) => onUpdate && onUpdate(itemData);
    const handleDelete = (itemData) => onDelete && onDelete(itemData);
    const handleResetPassword = (itemData) => onResetPassword && onResetPassword(itemData);

    const hasAnyAction = onRead || onUpdate || onDelete || onResetPassword;

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    {columns.map((column, index) => (
                        <th key={index}>{column.name}</th>
                    ))}
                    {hasAnyAction && <th>Chức năng</th>}
                </tr>
            </thead>

            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length + (hasAnyAction ? 1 : 0)} className="text-center">
                            Không có dữ liệu
                        </td>
                    </tr>
                ) : (
                    data.map((rowData, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex}>
                                    {rowData[column.key] ?? '-'}
                                </td>
                            ))}
                            {hasAnyAction && (
                                <td>
                                    <ButtonGroup size="large">
                                        {onRead && (
                                            <Button color="info" onClick={() => handleRead(rowData)}>
                                                <FaEye />
                                            </Button>
                                        )}

                                        {onUpdate && (
                                            <Button color="secondary" onClick={() => handleUpdate(rowData)}>
                                                <MdEdit />
                                            </Button>
                                        )}

                                        {onDelete && (
                                            <Button color="error" onClick={() => handleDelete(rowData)}>
                                                <ImCross />
                                            </Button>
                                        )}

                                        {onResetPassword && rowData.fullData?.email && (
                                            <Button
                                                color="warning"
                                                onClick={() => handleResetPassword(rowData)}
                                                title="Cấp lại mật khẩu"
                                            >
                                                <MdVpnKey />
                                            </Button>
                                        )}
                                    </ButtonGroup>
                                </td>
                            )}
                        </tr>
                    ))
                )}
            </tbody>
        </Table>
    );
}

export default TableLayout;
