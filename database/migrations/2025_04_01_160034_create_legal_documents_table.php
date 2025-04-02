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
        Schema::create('legal_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('map_marker_id')->constrained('map_markers')->onDelete('cascade');
            $table->string('name')->comment('Tên tài liệu');
            $table->string('file_path')->comment('Đường dẫn đến file');
            $table->string('file_type')->nullable()->comment('Loại file');
            $table->string('file_size')->nullable()->comment('Kích thước file');
            $table->string('document_type')->default('legal')->comment('Loại tài liệu (pháp lý)');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('legal_documents');
    }
};
