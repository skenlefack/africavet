import React from 'react';

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    itemName = 'éléments',
    showItemsPerPage = true,
    itemsPerPageOptions = [10, 20, 50, 100]
}) => {
    if (totalItems === 0) return null;

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 py-3 px-3 bg-light rounded-bottom">
            {/* Info */}
            <div className="d-flex align-items-center gap-3">
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Affichage <strong>{startIndex}</strong> - <strong>{endIndex}</strong> sur <strong>{totalItems}</strong> {itemName}
                </span>

                {showItemsPerPage && (
                    <div className="d-flex align-items-center gap-2">
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto' }}
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                        >
                            {itemsPerPageOptions.map(opt => (
                                <option key={opt} value={opt}>{opt} / page</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Pagination buttons */}
            {totalPages > 1 && (
                <nav>
                    <ul className="pagination pagination-sm mb-0" style={{ gap: '4px' }}>
                        {/* First page */}
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link border-0 rounded"
                                onClick={() => onPageChange(1)}
                                disabled={currentPage === 1}
                                title="Première page"
                                style={{ minWidth: '36px' }}
                            >
                                <i className="fas fa-angle-double-left"></i>
                            </button>
                        </li>

                        {/* Previous page */}
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link border-0 rounded"
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                title="Page précédente"
                                style={{ minWidth: '36px' }}
                            >
                                <i className="fas fa-angle-left"></i>
                            </button>
                        </li>

                        {/* Page numbers */}
                        {pageNumbers.map((page, index) => (
                            <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
                                {page === '...' ? (
                                    <span className="page-link border-0 bg-transparent px-2">...</span>
                                ) : (
                                    <button
                                        className="page-link border-0 rounded"
                                        onClick={() => onPageChange(page)}
                                        style={{
                                            minWidth: '36px',
                                            background: page === currentPage ? 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)' : 'transparent',
                                            color: page === currentPage ? 'white' : '#6c757d',
                                            fontWeight: page === currentPage ? '600' : '400'
                                        }}
                                    >
                                        {page}
                                    </button>
                                )}
                            </li>
                        ))}

                        {/* Next page */}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link border-0 rounded"
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                title="Page suivante"
                                style={{ minWidth: '36px' }}
                            >
                                <i className="fas fa-angle-right"></i>
                            </button>
                        </li>

                        {/* Last page */}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link border-0 rounded"
                                onClick={() => onPageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                title="Dernière page"
                                style={{ minWidth: '36px' }}
                            >
                                <i className="fas fa-angle-double-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default Pagination;
