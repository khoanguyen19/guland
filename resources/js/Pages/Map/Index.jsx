import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MapComponent from '@/Components/Map/MapContainer';
import ChatWidget from '@/Components/ChatWidget';
import axios from 'axios';

const MapIndex = ({ auth }) => {
    const [layers, setLayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch các layer từ server
    // useEffect(() => {
    //     const fetchLayers = async () => {
    //         try {
    //             setIsLoading(true);
    //             const response = await axios.get(route('map.layers'));
    //             setLayers(response.data);
    //             setError(null);
    //         } catch (err) {
    //             console.error('Lỗi khi tải dữ liệu layer:', err);
    //             setError('Không thể tải dữ liệu các lớp bản đồ. Vui lòng thử lại sau.');
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchLayers();
    // }, []);

    // Dữ liệu mẫu cho các layer bản đồ
    useEffect(() => {
        // Giả lập dữ liệu layer để demo
        const demoLayers = [
            {
                id: 'qh-2030',
                name: 'Quy hoạch 2030',
                path: 'da-nang-2030',
                attribution: 'Quy hoạch TP.HCM 2030',
                opacity: 0.7
            },
            {
                id: 'qh-xd',
                name: 'Quy hoạch Xây dựng',
                path: 'danang-qhc',
                attribution: 'Quy hoạch TP.HCM 2030',
                opacity: 0.7
            }
        ];

        setLayers(demoLayers);
        setIsLoading(false);
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Bản đồ</h2>}
        >
            <Head title="Bản đồ" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <MapComponent customLayers={layers} />
                            {/* <div className="mt-4 text-sm text-gray-500">
                                <p>Hướng dẫn sử dụng:</p>
                                <ul className="mt-1 list-disc pl-5">
                                    <li>Click vào bản đồ để thêm điểm đánh dấu</li>
                                    <li>Dùng nút điều khiển lớp ở góc trên bên phải để bật/tắt các lớp bản đồ</li>
                                    <li>Click vào điểm đánh dấu để xem chi tiết, thêm tài liệu và bình luận</li>
                                </ul>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Chat Widget */}
            <ChatWidget />
            
        </AuthenticatedLayout>
    );
};

export default MapIndex;
