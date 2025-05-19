import React, { useEffect, useState, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap, Marker, Popup, Rectangle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LayerControl from './LayerControl';
import MarkerForm from './MarkerForm';
import MapMenu from './MapMenu';
import ProjectDetail from './ProjectDetail';
import MarkerControl from './MarkerControl';
import axios from 'axios';

const MapComponent = ({ customLayers = [] }) => {
    const [markers, setMarkers] = useState([]);
    const [activeLayers, setActiveLayers] = useState({});
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [showMarkerForm, setShowMarkerForm] = useState(false);
    const mapRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeMarkerId, setActiveMarkerId] = useState(null);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState(null);
    const [currentZoom, setCurrentZoom] = useState(13);
    const [activeRectangle, setActiveRectangle] = useState(null);
    const [markerDisplayMode, setMarkerDisplayMode] = useState('auto'); // 'off', 'auto', 'always'
    const [editingMarker, setEditingMarker] = useState(null); // State mới để lưu marker đang chỉnh sửa

    useEffect(() => {
        loadMarkers();
    }, [customLayers]);

    const loadMarkers = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(route('markers.index'));

            // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc dữ liệu của component
            const formattedMarkers = response.data.map(marker => ({
                id: marker.id,
                position: [marker.latitude, marker.longitude],
                title: marker.name,
                description: marker.note || '',
                user: marker.user,
                documents: marker.documents || [],
                comments: marker.comments || [],
                project_type: marker.project_type,
                product_type: marker.product_type,
                price: marker.price,
                start_date: marker.start_date,
                end_date: marker.end_date,
                fileStorageId: marker.fileStorageId || null
            }));

            setMarkers(formattedMarkers);
        } catch (error) {
            console.error('Lỗi khi tải markers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý click trên Rectangle để hiển thị thông tin chi tiết
    const handleRectangleClick = (markerId) => {
        if (activeRectangle === markerId) {
            // Nếu đã kích hoạt, bỏ kích hoạt
            setActiveRectangle(null);
        } else {
            // Nếu chưa kích hoạt, kích hoạt
            setActiveRectangle(markerId);
            handleMarkerClick(markerId);
        }
    };

    // Xử lý hiển thị menu context khi click chuột phải
    const handleContextMenu = (e) => {
        e.originalEvent.preventDefault();

        // Lấy tọa độ chính xác từ sự kiện
        const { clientX, clientY } = e.originalEvent;
        console.log(clientX, clientY, e.latlng)
        setContextMenuPosition({
            x: clientX,
            y: clientY,
            latlng: e.latlng
        });
    };

    // Xử lý lựa chọn "Thêm đánh dấu" từ menu context
    const handleAddMarkerFromMenu = () => {
        if (contextMenuPosition && contextMenuPosition.latlng) {
            setSelectedPosition({
                lat: contextMenuPosition.latlng.lat,
                lng: contextMenuPosition.latlng.lng,
                x: contextMenuPosition.x,
                y: contextMenuPosition.y
            });
            setShowMarkerForm(true);
        }
    };

    // Đóng menu context
    const handleCloseContextMenu = () => {
        setContextMenuPosition(null);
    };

    // Lưu marker mới
    const handleSaveMarker = async (data) => {
        try {
            setIsLoading(true);

            // Tách fileStorageId ra khỏi dữ liệu gửi đến API
            const { fileStorageId, files, ...markerData } = data;

            // Gửi dữ liệu đến API để lưu marker
            const response = await axios.post(route('markers.store'), {
                name: markerData.title,
                latitude: selectedPosition.lat,
                longitude: selectedPosition.lng,
                note: markerData.description,
                project_type: markerData.project_type,
                product_type: markerData.product_type,
                price: markerData.price,
                start_date: markerData.start_date,
                end_date: markerData.end_date
            });

            // Thêm marker mới vào state
            const newMarker = {
                id: response.data.id,
                position: [response.data.latitude, response.data.longitude],
                title: response.data.name,
                description: response.data.note || '',
                user: response.data.user,
                project_type: response.data.project_type,
                product_type: response.data.product_type,
                price: response.data.price,
                start_date: response.data.start_date,
                end_date: response.data.end_date,
                fileStorageId: fileStorageId, // Lưu ID để truy xuất file từ localStorage
                documents: [],
                comments: []
            };

            setMarkers(prev => [...prev, newMarker]);
        } catch (error) {
            console.error('Lỗi khi lưu marker:', error);
            alert('Có lỗi xảy ra khi lưu điểm đánh dấu. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
            setShowMarkerForm(false);
            setSelectedPosition(null);
            setContextMenuPosition(null); // Đảm bảo đóng menu context
        }
    };

    // Xóa marker
    const handleDeleteMarker = async (markerId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa điểm đánh dấu này?')) {
            return;
        }

        try {
            setIsLoading(true);
            await axios.delete(route('markers.destroy', { mapMarker: markerId }));

            // Xóa marker khỏi state sau khi xóa thành công từ API
            setMarkers(prev => prev.filter(marker => marker.id !== markerId));
        } catch (error) {
            console.error('Lỗi khi xóa marker:', error);
            alert('Có lỗi xảy ra khi xóa điểm đánh dấu. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Tải comments cho marker
    const loadComments = async (markerId) => {
        try {
            setIsLoading(true);
            const response = await axios.get(route('marker.comments.index', { mapMarker: markerId }));

            // Cập nhật comments cho marker
            setMarkers(prev => prev.map(marker => {
                if (marker.id === markerId) {
                    return { ...marker, comments: response.data };
                }
                return marker;
            }));
        } catch (error) {
            console.error('Lỗi khi tải bình luận:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý khi mở popup của marker
    const handleMarkerClick = (markerId) => {
        setActiveMarkerId(markerId);
        loadComments(markerId);
    };

    // Xử lý khi bắt đầu chỉnh sửa marker
    const handleEditMarker = (marker) => {
        // Lấy files từ localStorage nếu có
        let markerFiles = [];
        if (marker.fileStorageId) {
            const storedFiles = localStorage.getItem(marker.fileStorageId);
            if (storedFiles) {
                try {
                    markerFiles = JSON.parse(storedFiles);
                } catch (error) {
                    console.error('Lỗi khi đọc files từ localStorage:', error);
                }
            }
        }

        // Chuẩn bị dữ liệu cho form chỉnh sửa
        const formData = {
            id: marker.id,
            title: marker.title,
            description: marker.description,
            project_type: marker.project_type || '',
            product_type: marker.product_type || '',
            price: marker.price || '',
            start_date: marker.start_date || '',
            end_date: marker.end_date || '',
            files: markerFiles,
            fileStorageId: marker.fileStorageId
        };

        setEditingMarker(formData);
        setShowMarkerForm(true);
    };

    // Lưu marker đã chỉnh sửa
    const handleUpdateMarker = async (data) => {
        try {
            setIsLoading(true);

            // Tách fileStorageId và files ra khỏi dữ liệu gửi đến API
            const { id, fileStorageId, files, ...markerData } = data;

            // Lưu files vào localStorage nếu có
            let updatedFileStorageId = fileStorageId;
            if (files && files.length > 0) {
                if (!fileStorageId) {
                    // Tạo ID mới nếu chưa có
                    updatedFileStorageId = 'marker_' + Date.now();
                }
                localStorage.setItem(updatedFileStorageId, JSON.stringify(files));
            }

            // Gửi dữ liệu đến API để cập nhật marker
            const response = await axios.put(route('markers.update', { mapMarker: id }), {
                name: markerData.title,
                note: markerData.description,
                project_type: markerData.project_type,
                product_type: markerData.product_type,
                price: markerData.price,
                start_date: markerData.start_date,
                end_date: markerData.end_date
            });

            // Cập nhật marker trong state
            setMarkers(prev => prev.map(marker => {
                if (marker.id === id) {
                    return {
                        ...marker,
                        title: response.data.name,
                        description: response.data.note || '',
                        project_type: response.data.project_type,
                        product_type: response.data.product_type,
                        price: response.data.price,
                        start_date: response.data.start_date,
                        end_date: response.data.end_date,
                        fileStorageId: updatedFileStorageId
                    };
                }
                return marker;
            }));

            alert('Marker đã được cập nhật thành công!');
        } catch (error) {
            console.error('Lỗi khi cập nhật marker:', error);
            alert('Có lỗi xảy ra khi cập nhật marker. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
            setShowMarkerForm(false);
            setEditingMarker(null);
        }
    };

    // Thêm comment mới
    const handleAddComment = (markerId, comment) => {
        setMarkers(prev => prev.map(marker => {
            if (marker.id === markerId) {
                return {
                    ...marker,
                    comments: [comment, ...marker.comments]
                };
            }
            return marker;
        }));
        setShowCommentForm(false);
    };

    // Component MapEvents để xử lý sự kiện của bản đồ
    const MapEvents = () => {
        const map = useMap();
        useEffect(() => {
            // Chỉ giữ lại sự kiện zoom, bỏ sự kiện contextmenu
            map.on('zoomend', () => {
                const newZoom = map.getZoom();
                setCurrentZoom(newZoom);
            });

            map.on('contextmenu', handleContextMenu);


            // Thiết lập zoom ban đầu
            setCurrentZoom(map.getZoom());

            return () => {
                // Hủy đăng ký sự kiện khi component unmount
                map.off('zoomend');
            };
        }, [map]);

        return null;
    };


    // Tạo marker hoặc project detail dựa vào mức độ zoom
    const renderMarkers = () => {
        // Nếu chế độ hiển thị là 'off', không hiển thị marker nào
        if (markerDisplayMode === 'off') {
            return null;
        }

        return markers.map(marker => {
            const projectData = {
                id: marker.id,
                name: marker.title,
                project_type: marker.project_type || 'Dự án bất động sản',
                product_type: marker.product_type || 'Đất nền',
                price: marker.price || 0,
                start_date: marker.start_date,
                end_date: marker.end_date,
                note: marker.description,
                fileStorageId: marker.fileStorageId, // Truyền ID để lấy file từ localStorage
                legalDocuments: marker.legalDocuments || []
            };

            // Nếu chế độ hiển thị là 'auto', hiển thị dựa vào zoom level
            // Nếu chế độ hiển thị là 'always', luôn hiển thị marker đơn giản
            if (markerDisplayMode === 'always' || (markerDisplayMode === 'auto' && currentZoom < 14)) {
                return (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        eventHandlers={{
                            click: () => handleMarkerClick(marker.id)
                        }}
                    >
                        <Popup>
                            <ProjectDetail project={projectData} />
                            <div className="mt-3 pt-2 border-t">
                                <div className="max-h-[40vh] overflow-y-auto">
                                    <p className="whitespace-pre-line">{marker.description}</p>
                                </div>
                                <div className="mt-3 pt-2 border-t flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteMarker(marker.id);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Xóa điểm đánh dấu
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditMarker(marker);
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Chỉnh sửa điểm đánh dấu
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            } else if (markerDisplayMode === 'auto' && currentZoom >= 14) {
                // Tính toán bounds cho Rectangle
                const offset = 0.001; // Khoảng cách offset
                const bounds = [
                    [marker.position[0] - offset, marker.position[1] - offset * 1.5],
                    [marker.position[0] + offset, marker.position[1] + offset * 1.5]
                ];

                const isActive = activeRectangle === marker.id;

                return (
                    <div key={marker.id}>
                        {/* Rectangle để đánh dấu khu vực dự án */}
                        <Rectangle
                            bounds={bounds}
                        >
                            <Tooltip
                                key={`tooltip-${marker.id}-${isActive}`}
                                direction="center"
                                permanent={true}
                                opacity={1}
                                interactive={true}
                                eventHandlers={{
                                    click: (e) => {
                                        e.originalEvent.stopPropagation();
                                        handleRectangleClick(marker.id);
                                    },
                                }}
                            >
                                <ProjectDetail project={projectData} />
                                {isActive && (
                                    <div className="mt-3 pt-2 border-t">
                                        <div className="max-h-[40vh] overflow-y-auto">
                                            <p className="whitespace-pre-line">{marker.description}</p>
                                        </div>
                                        <div className="mt-3 pt-2 border-t flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteMarker(marker.id);
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Xóa điểm đánh dấu
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditMarker(marker);
                                                }}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Chỉnh sửa điểm đánh dấu
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Tooltip>
                        </Rectangle>
                    </div>
                );
            }

            return null;
        });

    };

    return (
        <div className="relative h-[80vh] w-full">

            <LeafletMapContainer
                center={[16.047079, 108.206230]} // Tọa độ Đà Nẵng
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
                whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                    // Thiết lập zoom ban đầu
                    setCurrentZoom(mapInstance.getZoom());
                }}
            >
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='Gempire'
                />

                {/* Custom Layers */}
                {customLayers.map(layer => (
                    activeLayers[layer.id] && (
                        <TileLayer
                            key={layer.id}
                            url={`/tiles/${layer.path}/{z}/{x}_{y}.png`}
                            attribution={layer.attribution || ''}
                            opacity={layer.opacity || 0.7}
                        />
                    )
                ))}

                {/* Markers hoặc Project Details dựa vào mức độ zoom */}
                {renderMarkers()}

                <MapEvents />
            </LeafletMapContainer>

            {/* Layer Control */}
            <LayerControl
                layers={customLayers}
                activeLayers={activeLayers}
                onLayerToggle={(layerId, isActive) => {
                    setActiveLayers(prev => ({
                        ...prev,
                        [layerId]: isActive
                    }));
                }}
            />

            {/* Marker Display Control */}
            <MarkerControl
                displayMode={markerDisplayMode}
                onModeChange={(mode) => setMarkerDisplayMode(mode)}
            />

            {/* Context Menu */}
            {contextMenuPosition && (
                <MapMenu
                    position={contextMenuPosition}
                    onAddMarker={handleAddMarkerFromMenu}
                    onClose={handleCloseContextMenu}
                />
            )}

            {/* Marker Form Modal */}
            {showMarkerForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingMarker ? 'Chỉnh sửa điểm đánh dấu' : 'Thêm điểm đánh dấu'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowMarkerForm(false);
                                    setSelectedPosition(null);
                                    setEditingMarker(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <MarkerForm
                            initialData={editingMarker}
                            onSave={editingMarker ? handleUpdateMarker : handleSaveMarker}
                            onCancel={() => {
                                setShowMarkerForm(false);
                                setSelectedPosition(null);
                                setEditingMarker(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
