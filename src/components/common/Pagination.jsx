import { Pagination as BootstrapPagination } from 'react-bootstrap';
import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    if (totalPages === 0) return null;

    return (
        <div className="pagination-container">
            <BootstrapPagination className="mb-0">
                <BootstrapPagination.First
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(1)}
                />
                <BootstrapPagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                />

                {startPage > 1 && (
                    <>
                        <BootstrapPagination.Item onClick={() => onPageChange(1)}>
                            1
                        </BootstrapPagination.Item>
                        {startPage > 2 && <BootstrapPagination.Ellipsis disabled />}
                    </>
                )}

                {pageNumbers.map(number => (
                    <BootstrapPagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => onPageChange(number)}
                    >
                        {number}
                    </BootstrapPagination.Item>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <BootstrapPagination.Ellipsis disabled />}
                        <BootstrapPagination.Item onClick={() => onPageChange(totalPages)}>
                            {totalPages}
                        </BootstrapPagination.Item>
                    </>
                )}

                <BootstrapPagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                />
                <BootstrapPagination.Last
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(totalPages)}
                />
            </BootstrapPagination>
        </div>
    );
}

export default Pagination;
