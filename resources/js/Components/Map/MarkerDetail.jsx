import React, { useState } from 'react';

const MarkerDetail = ({ marker, onAddDocument, onAddComment, onClose }) => {
    const [newComment, setNewComment] = useState('');
    const [documentFile, setDocumentFile] = useState(null);
    const [documentName, setDocumentName] = useState('');
    
    const handleAddComment = () => {
        if (!newComment.trim()) return;
        
        const comment = {
            id: Date.now().toString(),
            text: newComment,
            author: 'Người dùng', // Có thể lấy từ auth của Laravel
            date: new Date().toLocaleString('vi-VN')
        };
        
        onAddComment(marker.id, comment);
        setNewComment('');
    };
    
    const handleAddDocument = () => {
        if (!documentFile || !documentName.trim()) return;
        
        // Trong môi trường thực tế, bạn sẽ tải file lên server
        // Đây là mô phỏng cho mục đích demo
        const document = {
            id: Date.now().toString(),
            name: documentName,
            url: '#', // URL giả định
            fileName: documentFile.name
        };
        
        onAddDocument(marker.id, document);
        setDocumentFile(null);
        setDocumentName('');
    };
    
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md">
            <div className="bg-blue-600 text-white py-2 px-4 flex justify-between items-center">
                <h2 className="text-lg font-bold">{marker.title}</h2>
                <button 
                    onClick={onClose}
                    className="text-white hover:text-gray-200"
                >
                    &times;
                </button>
            </div>
            
            <div className="p-4">
                <p className="mb-4">{marker.description}</p>
                
                {/* Tài liệu */}
                <div className="mb-4">
                    <h3 className="font-bold text-gray-700 mb-2">Tài liệu</h3>
                    {marker.documents.length > 0 ? (
                        <ul className="list-disc pl-5 mb-3">
                            {marker.documents.map(doc => (
                                <li key={doc.id}>
                                    <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        {doc.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 mb-3">Chưa có tài liệu</p>
                    )}
                    
                    <div className="border-t pt-2">
                        <h4 className="font-semibold mb-2">Thêm tài liệu mới</h4>
                        <div className="space-y-2">
                            <div>
                                <label htmlFor="documentName" className="block text-sm">Tên tài liệu</label>
                                <input
                                    type="text"
                                    id="documentName"
                                    value={documentName}
                                    onChange={e => setDocumentName(e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="documentFile" className="block text-sm">Chọn file</label>
                                <input
                                    type="file"
                                    id="documentFile"
                                    onChange={e => setDocumentFile(e.target.files[0])}
                                    className="w-full"
                                />
                            </div>
                            <button
                                onClick={handleAddDocument}
                                disabled={!documentFile || !documentName.trim()}
                                className="bg-blue-500 text-white px-3 py-1 rounded disabled:bg-gray-300"
                            >
                                Thêm tài liệu
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Bình luận */}
                <div>
                    <h3 className="font-bold text-gray-700 mb-2">Bình luận</h3>
                    <div className="mb-3 max-h-40 overflow-y-auto">
                        {marker.comments.length > 0 ? (
                            marker.comments.map(comment => (
                                <div key={comment.id} className="border-b py-2 last:border-0">
                                    <p>{comment.text}</p>
                                    <p className="text-xs text-gray-500">{comment.author} - {comment.date}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Chưa có bình luận</p>
                        )}
                    </div>
                    
                    <div className="border-t pt-2">
                        <h4 className="font-semibold mb-2">Thêm bình luận mới</h4>
                        <div className="flex space-x-2">
                            <textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                className="flex-1 border-gray-300 rounded-md shadow-sm"
                                rows="2"
                                placeholder="Nhập bình luận của bạn..."
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="bg-blue-500 text-white px-3 py-1 rounded disabled:bg-gray-300 self-end"
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkerDetail;
