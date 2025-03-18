<?php

namespace App\Http\Controllers;

use App\Models\MapMarker;
use App\Models\MarkerComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MarkerCommentController extends Controller
{
    /**
     * Lấy danh sách bình luận của một marker.
     *
     * @param  \App\Models\MapMarker  $mapMarker
     * @return \Illuminate\Http\Response
     */
    public function index(MapMarker $mapMarker)
    {
        $comments = $mapMarker->comments()
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                    ],
                    'created_at' => $comment->created_at->format('d/m/Y H:i'),
                ];
            });

        return response()->json($comments);
    }

    /**
     * Thêm bình luận mới cho marker.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\MapMarker  $mapMarker
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, MapMarker $mapMarker)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $comment = new MarkerComment();
        $comment->content = $validated['content'];
        $comment->user_id = Auth::id();
        $comment->map_marker_id = $mapMarker->id;
        $comment->save();

        return response()->json([
            'id' => $comment->id,
            'content' => $comment->content,
            'user' => [
                'id' => Auth::id(),
                'name' => Auth::user()->name,
            ],
            'created_at' => $comment->created_at->format('d/m/Y H:i'),
        ], 201);
    }

    /**
     * Cập nhật bình luận.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\MarkerComment  $comment
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, MarkerComment $comment)
    {
        // Kiểm tra quyền chỉnh sửa
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền chỉnh sửa bình luận này'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $comment->content = $validated['content'];
        $comment->save();

        return response()->json([
            'id' => $comment->id,
            'content' => $comment->content,
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
            ],
            'created_at' => $comment->created_at->format('d/m/Y H:i'),
            'updated_at' => $comment->updated_at->format('d/m/Y H:i'),
        ]);
    }

    /**
     * Xóa bình luận.
     *
     * @param  \App\Models\MarkerComment  $comment
     * @return \Illuminate\Http\Response
     */
    public function destroy(MarkerComment $comment)
    {
        // Kiểm tra quyền xóa
        if ($comment->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Bạn không có quyền xóa bình luận này'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Bình luận đã được xóa thành công']);
    }
}
