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
        Schema::table('map_markers', function (Blueprint $table) {
            $table->string('project_type')->nullable()->comment('Loại hình dự án (sơ cấp/thứ cấp)');
            $table->string('product_type')->nullable()->comment('Loại hình sản phẩm');
            $table->string('city')->comment('Thành phố');
            $table->decimal('price', 15, 2)->nullable()->comment('Giá bán');
            $table->date('start_date')->nullable()->comment('Ngày bắt đầu');
            $table->date('end_date')->nullable()->comment('Ngày kết thúc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('map_markers', function (Blueprint $table) {
            $table->dropColumn([
                'project_type',
                'product_type',
                'city',
                'price',
                'start_date',
                'end_date',
            ]);
        });
    }
};
