<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\MarkerDocument;
use App\Models\MarkerComment;
use App\Models\LegalDocument;

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
        'project_type',
        'product_type',
        'city',
        'price',
        'start_date',
        'end_date',
    ];

    /**
     * Các thuộc tính sẽ được ép kiểu
     */
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'price' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
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

    /**
     * Lấy danh sách tài liệu pháp lý của marker
     */
    public function legalDocuments()
    {
        return $this->hasMany(LegalDocument::class);
    }
}
