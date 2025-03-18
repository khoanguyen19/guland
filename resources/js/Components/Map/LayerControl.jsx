import React from 'react';

const LayerControl = ({ layers, activeLayers, onLayerToggle }) => {
    return (
        <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-[1000] max-h-80 overflow-y-auto">
            <h3 className="text-sm font-bold mb-2 border-b pb-1">Danh sách lớp bản đồ</h3>
            <ul className="space-y-1">
                {layers.map(layer => (
                    <li key={layer.id} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={`layer-${layer.id}`}
                            checked={activeLayers[layer.id] || false}
                            onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
                            className="rounded"
                        />
                        <label htmlFor={`layer-${layer.id}`} className="text-sm cursor-pointer">
                            {layer.name}
                        </label>
                    </li>
                ))}
                {layers.length === 0 && (
                    <li className="text-xs text-gray-500">Chưa có lớp bản đồ nào</li>
                )}
            </ul>
        </div>
    );
};

export default LayerControl;
