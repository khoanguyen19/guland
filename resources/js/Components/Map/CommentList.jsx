import React from 'react';

const CommentList = ({ comments }) => {
    if (!comments || comments.length === 0) {
        return <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>;
    }

    return (
        <div className="max-h-40 overflow-y-auto">
            {comments.map(comment => (
                <div key={comment.id} className="border-t py-2">
                    <p className="text-sm">{comment.content}</p>
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>{comment.user.name}</span>
                        <span>{comment.created_at}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommentList;
