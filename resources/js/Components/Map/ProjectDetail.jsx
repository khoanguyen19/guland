import React from 'react';

const ProjectDetail = ({ project }) => {
    if (!project) return null;

    // Định dạng giá tiền
    const formatPrice = (price) => {
        if (!price) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
    };

    // Định dạng ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
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

                <div className="mb-2">
                    <strong>Ghi chú:</strong>
                    <div className="ml-2 max-w-full truncate">{project.note || 'Không có ghi chú'}</div>
                </div>

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
