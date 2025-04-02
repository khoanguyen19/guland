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
    const [hoveredRectangle, setHoveredRectangle] = useState(null);
    const [activeRectangle, setActiveRectangle] = useState(null);
    const [markerDisplayMode, setMarkerDisplayMode] = useState('auto'); // 'off', 'auto', 'always'

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
                comments: marker.comments || []
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

            // Gửi dữ liệu đến API để lưu marker
            const response = await axios.post(route('markers.store'), {
                name: data.title,
                latitude: selectedPosition.lat,
                longitude: selectedPosition.lng,
                note: data.description
            });

            // Thêm marker mới vào state
            const newMarker = {
                id: response.data.id,
                position: [response.data.latitude, response.data.longitude],
                title: response.data.name,
                description: response.data.note || '',
                user: response.data.user,
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
        <div className="relative h-[600px] w-full">

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

            {/* Marker Form */}
            {showMarkerForm && selectedPosition && (
                <div className="absolute bg-white p-4 shadow-md z-[1000] w-80 rounded-md"
                    style={{
                        top: `${selectedPosition.y - 290}px`,
                        left: `${selectedPosition.x - 290}px`,
                        transform: 'translate(0, 0)'
                    }}
                >
                    <MarkerForm
                        onSave={handleSaveMarker}
                        onCancel={() => {
                            setShowMarkerForm(false);
                            setSelectedPosition(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default MapComponent;
