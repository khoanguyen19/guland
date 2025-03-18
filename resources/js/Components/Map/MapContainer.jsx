import React, { useEffect, useState, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LayerControl from './LayerControl';
import MarkerForm from './MarkerForm';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
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

    // Sửa vấn đề icon của Leaflet trong React
    useEffect(() => {
        // delete L.Icon.Default.prototype._getIconUrl;
        // L.Icon.Default.mergeOptions({
        //     iconRetinaUrl: '/marker-icon-2x.png',
        //     iconUrl: '/marker-icon.png',
        //     shadowUrl: '/marker-shadow.png',
        // });

        // // Khởi tạo trạng thái các layer
        // const initialLayerState = {};
        // customLayers.forEach(layer => {
        //     initialLayerState[layer.id] = true; // Bật mặc định
        // });
        // setActiveLayers(initialLayerState);

        // Tải markers từ API
        loadMarkers();
    }, [customLayers]);

    // Tải danh sách markers từ API
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

    // Xử lý click trên bản đồ để thêm marker
    const handleMapClick = (e) => {
        setSelectedPosition(e.latlng);
        setShowMarkerForm(true);
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
            map.on('click', handleMapClick);

            return () => {
                map.off('click', handleMapClick);
            };
        }, [map]);

        return null;
    };

    return (
        <div className="relative h-[600px] w-full">
            {isLoading && (
                <div className="absolute top-0 left-0 z-[2000] flex h-full w-full items-center justify-center bg-white bg-opacity-70">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-700">Đang xử lý...</p>
                    </div>
                </div>
            )}

            <LeafletMapContainer
                center={[16.047079, 108.206230]} // Tọa độ Đà Nẵng
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

                {/* Markers */}
                {markers.map(marker => (
                    <Marker 
                        key={marker.id} 
                        position={marker.position}
                        eventHandlers={{
                            click: () => handleMarkerClick(marker.id)
                        }}
                    >
                        <Popup>
                            <div className="max-w-xs">
                                <h3 className="font-bold">{marker.title}</h3>
                                <p>{marker.description}</p>
                                
                                {/* Phần bình luận */}
                                <div className="mt-3 border-t pt-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold">Bình luận ({marker.comments.length})</h4>
                                        {!showCommentForm && (
                                            <button 
                                                onClick={() => setShowCommentForm(true)}
                                                className="text-xs text-blue-500 hover:underline"
                                            >
                                                Thêm bình luận
                                            </button>
                                        )}
                                    </div>
                                    
                                    {showCommentForm && activeMarkerId === marker.id ? (
                                        <CommentForm 
                                            markerId={marker.id}
                                            onCommentAdded={(comment) => handleAddComment(marker.id, comment)}
                                            onCancel={() => setShowCommentForm(false)}
                                        />
                                    ) : (
                                        <div className="mt-2">
                                            <CommentList comments={marker.comments} />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Nút xóa marker */}
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
                ))}

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

            {/* Marker Form */}
            {showMarkerForm && selectedPosition && (
                <div className="absolute top-0 right-0 bg-white p-4 shadow-md z-[1000] w-80">
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
