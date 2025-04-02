<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('map_markers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên dự án
            $table->double('latitude', 10, 7); // Tọa độ vĩ độ
            $table->double('longitude', 10, 7); // Tọa độ kinh độ
            $table->text('note')->nullable(); // Ghi chú cho marker, có thể null
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Người tạo marker
            $table->timestamps(); // Thời gian tạo và cập nhật
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('map_markers');
    }
};
