import React, { useState, useEffect } from 'react';

const ProjectDetail = ({ project }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        // Lấy files từ localStorage nếu có fileStorageId
        if (project && project.fileStorageId) {
            const storedFiles = localStorage.getItem(project.fileStorageId);
            if (storedFiles) {
                try {
                    setFiles(JSON.parse(storedFiles));
                } catch (error) {
                    console.error('Lỗi khi đọc files từ localStorage:', error);
                }
            }
        }
    }, [project]);

    if (!project) return null;

    // Định dạng giá tiền
    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        const billion = 1000000000;
        const million = 1000000;
        const thousand = 1000;
        if (price >= billion) {
            return (price / billion).toFixed(1) + ' tỷ';
        } else if (price >= million) {
            return (price / million).toFixed(1) + ' triệu';
        } else if (price >= thousand) {
            return (price / thousand).toFixed(1) + ' nghìn';
        } else {
            return price.toFixed(1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        }
    };

    // Định dạng ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    // Mở file PDF trong tab mới
    const openPdfFile = (fileData) => {
        // Tạo một tab mới và mở file PDF
        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head>
                    <title>${fileData.name}</title>
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            height: 100%;
                            overflow: hidden;
                        }
                        iframe {
                            width: 100%;
                            height: 100%;
                            border: none;
                        }
                    </style>
                </head>
                <body>
                    <iframe src="${fileData.data}" type="application/pdf"></iframe>
                </body>
            </html>
        `);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="bg-blue-500 text-white font-bold py-2 px-3 rounded-t-lg -mt-3 -mx-3 mb-2">
                {project.name}
            </div>

            <div className="text-sm">
                <div className="mb-2">
                    <strong>Loại hình dự án:</strong> {project.project_type || 'Chưa cập nhật'}
                </div>

                <div className="mb-2">
                    <strong>Loại hình sản phẩm:</strong> {project.product_type || 'Chưa cập nhật'}
                </div>

                <div className="mb-2">
                    <strong>Diện tích và giá bán:</strong>
                    <div className="ml-2">
                        <div>Giá: {formatPrice(project.price)}</div>
                    </div>
                </div>

                <div className="mb-2">
                    <strong>Thời gian hoạt động:</strong>
                    <div className="ml-2">
                        <div>Từ: {formatDate(project.start_date)}</div>
                        <div>Đến: {formatDate(project.end_date)}</div>
                    </div>
                </div>

                {/* Hiển thị files từ localStorage */}
                {files.length > 0 && (
                    <div className="mb-2">
                        <strong>Tài liệu dự án:</strong>
                        <div className="ml-2 truncate">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center text-blue-500 hover:underline cursor-pointer" onClick={() => openPdfFile(file)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    {file.name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {project.legalDocuments && project.legalDocuments.length > 0 && (
                    <div className="mb-2">
                        <strong>Pháp lý:</strong>
                        <div className="ml-2">
                            {project.legalDocuments.map((doc, index) => (
                                <div key={index} className="text-blue-500 hover:underline">
                                    <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                                        {doc.name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetail;
