<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MapMarkerController;
use App\Http\Controllers\MarkerCommentController;
use App\Http\Controllers\ReportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Trang báo cáo
    Route::get('/report', [ReportController::class, 'index'])->name('report');
});

Route::get('/map', function () {
    return Inertia::render('Map/Index');
})->name('map');

Route::get('/assistant', function () {
    return Inertia::render('Assistant/Index');
})->name('assistant');

// Route::get('/map/layers', [MapController::class, 'getLayers'])->name('map.layers');

// API cho MapMarker
Route::middleware('auth')->group(function () {
    Route::get('/api/markers', [MapMarkerController::class, 'index'])->name('markers.index');
    Route::post('/api/markers', [MapMarkerController::class, 'store'])->name('markers.store');
    Route::get('/api/markers/{mapMarker}', [MapMarkerController::class, 'show'])->name('markers.show');
    Route::put('/api/markers/{mapMarker}', [MapMarkerController::class, 'update'])->name('markers.update');
    Route::delete('/api/markers/{mapMarker}', [MapMarkerController::class, 'destroy'])->name('markers.destroy');

    // API cho MarkerComment
    Route::get('/api/markers/{mapMarker}/comments', [MarkerCommentController::class, 'index'])->name('marker.comments.index');
    Route::post('/api/markers/{mapMarker}/comments', [MarkerCommentController::class, 'store'])->name('marker.comments.store');
    Route::put('/api/comments/{comment}', [MarkerCommentController::class, 'update'])->name('marker.comments.update');
    Route::delete('/api/comments/{comment}', [MarkerCommentController::class, 'destroy'])->name('marker.comments.destroy');
});

require __DIR__.'/auth.php';
