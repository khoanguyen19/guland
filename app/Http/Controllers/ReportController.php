<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Hiển thị trang báo cáo với iframe Looker Studio.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Report/Index');
    }
}
