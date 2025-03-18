<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\MarkerDocument;
use App\Models\MarkerComment;

class MapMarker extends Model
{
    use HasFactory;

    /**
     * Các thuộc tính có thể gán hàng loạt
     */
    protected $fillable = [
        'name',
        'latitude', 
        'longitude',
        'note',
        'user_id',
    ];

    /**
     * Các thuộc tính sẽ được ép kiểu
     */
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    /**
     * Lấy người dùng đã tạo marker
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Lấy danh sách tài liệu của marker
     */
    public function documents()
    {
        return $this->hasMany(MarkerDocument::class);
    }

    /**
     * Lấy danh sách bình luận của marker
     */
    public function comments()
    {
        return $this->hasMany(MarkerComment::class);
    }
}
