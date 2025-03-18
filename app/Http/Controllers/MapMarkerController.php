<?php

namespace App\Http\Controllers;

use App\Models\MapMarker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MapMarkerController extends Controller
{
    /**
     * Lấy danh sách tất cả các marker
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $markers = MapMarker::with(['user:id,name'])
            ->latest()
            ->get();

        return response()->json($markers);
    }

    /**
     * Lưu marker mới vào cơ sở dữ liệu
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'note' => 'nullable|string',
        ]);

        // Thêm user_id vào dữ liệu đã xác thực
        $validated['user_id'] = Auth::id();

        // Tạo marker mới
        $marker = MapMarker::create($validated);

        // Tải thêm quan hệ user
        $marker->load('user:id,name');

        return response()->json($marker, 201);
    }

    /**
     * Lấy thông tin chi tiết của marker bao gồm tài liệu và bình luận
     *
     * @param  \App\Models\MapMarker  $mapMarker
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(MapMarker $mapMarker)
    {
        $mapMarker->load(['user:id,name', 'documents', 'comments']);
        
        return response()->json($mapMarker);
    }

    /**
     * Cập nhật thông tin marker
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\MapMarker  $mapMarker
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, MapMarker $mapMarker)
    {
        // Kiểm tra quyền sở hữu
        if ($mapMarker->user_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền chỉnh sửa marker này'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'note' => 'nullable|string',
        ]);

        $mapMarker->update($validated);
        
        return response()->json($mapMarker);
    }

    /**
     * Xóa marker
     *
     * @param  \App\Models\MapMarker  $mapMarker
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(MapMarker $mapMarker)
    {
        // Kiểm tra quyền sở hữu
        if ($mapMarker->user_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền xóa marker này'], 403);
        }

        $mapMarker->delete();
        
        return response()->json(['message' => 'Marker đã được xóa thành công']);
    }
}
