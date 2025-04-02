import React from 'react';

const MapMenu = ({ position, onAddMarker, onClose }) => {
    if (!position) return null;

    const style = {
        position: 'absolute',
        left: `${position.x - 150}px`,
        top: `${position.y - 150}px`,
        zIndex: 1000,
        transform: 'translate(0, 0)' // Hiển thị menu ngay tại vị trí con trỏ
    };

    const handleAddMarker = () => {
        onAddMarker();
        onClose();
    };

    // Xử lý click ra ngoài menu để đóng
    const handleOutsideClick = (e) => {
        e.stopPropagation();
        onClose();
    };

    React.useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return (
        <div style={style} className="bg-white shadow-md rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-100">
                <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={handleAddMarker}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Thêm đánh dấu
                </li>
            </ul>
        </div>
    );
};

export default MapMenu;
