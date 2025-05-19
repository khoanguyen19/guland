import React, { useState, useEffect } from 'react';

const MarkerFileUpload = ({ files, onFileAdd, onFileRemove }) => {
    const [fileList, setFileList] = useState(files || []);
    
    useEffect(() => {
        setFileList(files || []);
    }, [files]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        
        // Chỉ chấp nhận file PDF
        if (selectedFile.type !== 'application/pdf') {
            alert('Chỉ chấp nhận file PDF!');
            return;
        }
        
        // Chuyển file thành base64 để lưu vào localStorage
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target.result;
            const newFile = {
                id: Date.now(), // ID duy nhất
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size,
                data: base64String
            };
            
            const updatedFiles = [...fileList, newFile];
            setFileList(updatedFiles);
            onFileAdd(newFile);
        };
        
        reader.readAsDataURL(selectedFile);
        
        // Reset input để có thể chọn lại cùng một file
        e.target.value = '';
    };
    
    const handleRemoveFile = (fileId) => {
        const updatedFiles = fileList.filter(file => file.id !== fileId);
        setFileList(updatedFiles);
        onFileRemove(fileId);
    };
    
    // Hàm format kích thước file
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };
    
    return (
        <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Tài liệu dự án</label>
            
            <div className="mb-3">
                <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm tài liệu PDF
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            
            {fileList.length > 0 && (
                <div className="border rounded-md p-3 bg-gray-50">
                    <h4 className="font-medium mb-2">Tài liệu đã thêm:</h4>
                    <ul className="space-y-2">
                        {fileList.map(file => (
                            <li key={file.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                                    <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveFile(file.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MarkerFileUpload;
