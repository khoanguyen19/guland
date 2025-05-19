import React, { useState, useEffect } from 'react';
import MarkerFileUpload from './MarkerFileUpload';

const MarkerForm = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        project_type: '',
        product_type: '',
        price: '',
        start_date: '',
        end_date: '',
        files: [],
        fileStorageId: null
    });

    // Cập nhật formData khi có initialData (chế độ chỉnh sửa)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Danh sách các loại hình dự án
    const projectTypes = [
        { value: 'Sơ cấp', label: 'Sơ cấp' },
        { value: 'Thứ cấp', label: 'Thứ cấp' }
    ];

    // Danh sách các loại hình sản phẩm
    const productTypes = [
        { value: '', label: 'Chọn loại hình sản phẩm' },
        { value: 'Đất nền', label: 'Đất nền' },
        { value: 'Căn hộ', label: 'Căn hộ' },
        { value: 'Biệt thự', label: 'Biệt thự' },
        { value: 'Nhà phố', label: 'Nhà phố' },
        { value: 'Đơn lập', label: 'Đơn lập' },
        { value: 'Song lập', label: 'Song lập' },
        { value: 'Nhà vườn', label: 'Nhà vườn' },
        { value: 'Khác', label: 'Khác' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileAdd = (newFile) => {
        setFormData(prev => ({
            ...prev,
            files: [...prev.files, newFile]
        }));
    };

    const handleFileRemove = (fileId) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter(file => file.id !== fileId)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) {
            alert('Vui lòng nhập tiêu đề!');
            return;
        }
        
        // Nếu đang ở chế độ chỉnh sửa, trả về toàn bộ formData
        if (initialData) {
            onSave(formData);
            return;
        }
        
        // Nếu đang ở chế độ thêm mới và có files
        if (formData.files.length > 0) {
            // Tạo một key duy nhất cho marker này
            const markerId = 'marker_' + Date.now();
            localStorage.setItem(markerId, JSON.stringify(formData.files));
            
            // Thêm ID vào formData để có thể truy xuất files sau này
            const formDataWithFileId = {
                ...formData,
                fileStorageId: markerId
            };
            
            onSave(formDataWithFileId);
        } else {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {!initialData && <h3 className="text-lg font-bold mb-3">Thêm điểm đánh dấu</h3>}

            <div className="mb-3">
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                />
            </div>

            <div className="mb-3">
                <label htmlFor="project_type" className="block text-sm font-medium mb-1">
                    Loại hình dự án
                </label>
                <select
                    id="project_type"
                    name="project_type"
                    value={formData.project_type}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    {projectTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="product_type" className="block text-sm font-medium mb-1">
                    Loại hình sản phẩm
                </label>
                <select
                    id="product_type"
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    {productTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="price" className="block text-sm font-medium mb-1">
                    Giá bán
                </label>
                <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>

            <div className="mb-3">
                <label htmlFor="start_date" className="block text-sm font-medium mb-1">
                    Ngày bắt đầu
                </label>
                <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>

            <div className="mb-3">
                <label htmlFor="end_date" className="block text-sm font-medium mb-1">
                    Ngày kết thúc
                </label>
                <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Mô tả
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            
            {/* Component tải lên file */}
            <MarkerFileUpload 
                files={formData.files}
                onFileAdd={handleFileAdd}
                onFileRemove={handleFileRemove}
            />

            <div className="flex justify-end space-x-2 mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {initialData ? 'Cập nhật' : 'Lưu'}
                </button>
            </div>
        </form>
    );
};

export default MarkerForm;
