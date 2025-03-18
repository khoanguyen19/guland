<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\MapMarker;
use App\Models\User;

class MarkerComment extends Model
{
    use HasFactory;

    /**
     * Các thuộc tính có thể gán giá trị hàng loạt.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'content',
        'map_marker_id',
        'user_id',
    ];

    /**
     * Lấy marker mà comment thuộc về.
     */
    public function mapMarker(): BelongsTo
    {
        return $this->belongsTo(MapMarker::class);
    }

    /**
     * Lấy người dùng đã tạo comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
