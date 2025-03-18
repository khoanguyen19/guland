import React, { useState } from 'react';

const MarkerForm = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) {
            alert('Vui lòng nhập tiêu đề!');
            return;
        }
        onSave(formData);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-bold mb-3">Thêm điểm đánh dấu</h3>
            
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
            
            <div className="flex justify-end space-x-2">
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
                    Lưu
                </button>
            </div>
        </form>
    );
};

export default MarkerForm;
