<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\MapMarker;
use App\Models\User;

class LegalDocument extends Model
{
    use HasFactory;

    /**
     * Các thuộc tính có thể gán hàng loạt
     */
    protected $fillable = [
        'map_marker_id',
        'name',
        'file_path',
        'file_type',
        'file_size',
        'document_type',
        'user_id',
    ];

    /**
     * Lấy marker liên quan đến tài liệu pháp lý
     */
    public function mapMarker(): BelongsTo
    {
        return $this->belongsTo(MapMarker::class);
    }

    /**
     * Lấy người dùng đã tải lên tài liệu
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
