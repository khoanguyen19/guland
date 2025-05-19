import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MapComponent from '@/Components/Map/MapContainer';
import ChatWidget from '@/Components/ChatWidget';

const MapIndex = ({ auth }) => {
    const [layers, setLayers] = useState([]);


    useEffect(() => {
        const demoLayers = [
            {
                id: 'qh-2030',
                name: 'Quy hoạch 2030',
                path: 'da-nang-2030',
                attribution: 'Quy hoạch TP.HCM 2030',
                opacity: 1
            },
            {
                id: 'qh-xd',
                name: 'Quy hoạch Xây dựng',
                path: 'danang-qhc',
                attribution: 'Quy hoạch TP.HCM 2030',
                opacity: 1
            },
            {
                id: 'qh-hn-2',
                name: 'Quy hoạch Hanoi 20230',
                path: 'ha-noi-2030-2',
                attribution: 'Quy hoạch Hanoi 20230',
                opacity: 1
            }
        ];

        setLayers(demoLayers);
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Bản đồ</h2>}
        >
            <Head title="Bản đồ" />

            <div className="py-8">
                <div className="mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <MapComponent customLayers={layers} />
                        </div>
                    </div>
                </div>
            </div>

            <ChatWidget />

        </AuthenticatedLayout>
    );
};

export default MapIndex;
