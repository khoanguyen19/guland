import React, { useState } from 'react';
import axios from 'axios';

const CommentForm = ({ markerId, onCommentAdded, onCancel }) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim()) {
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await axios.post(
                route('marker.comments.store', { mapMarker: markerId }), 
                { content }
            );
            
            onCommentAdded(response.data);
            setContent('');
        } catch (error) {
            console.error('Lỗi khi thêm bình luận:', error);
            alert('Có lỗi xảy ra khi thêm bình luận. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-2">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                    placeholder="Thêm bình luận của bạn..."
                    rows="3"
                    disabled={isSubmitting}
                />
            </div>
            <div className="flex justify-end space-x-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded border border-gray-300 px-3 py-1 text-sm"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                )}
                <button
                    type="submit"
                    className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
            </div>
        </form>
    );
};

export default CommentForm;
