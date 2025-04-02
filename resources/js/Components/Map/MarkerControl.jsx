import React from 'react';

const MarkerControl = ({ displayMode, onModeChange }) => {
    const modes = [
        { id: 'off', label: 'Ẩn tất cả' },
        { id: 'auto', label: 'Tự động' },
        { id: 'always', label: 'Chỉ hiện đánh dấu' }
    ];

    return (
        <div className="absolute top-3 left-12 z-[1000] bg-white rounded-md shadow-md p-2">
            <div className="text-sm font-medium mb-2">Hiển thị điểm đánh dấu</div>
            <div className="flex flex-col space-y-1">
                {modes.map(mode => (
                    <label key={mode.id} className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="markerDisplayMode"
                            value={mode.id}
                            checked={displayMode === mode.id}
                            onChange={() => onModeChange(mode.id)}
                            className="mr-2"
                        />
                        <span className="text-sm">{mode.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default MarkerControl;
