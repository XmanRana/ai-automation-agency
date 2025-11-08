<?php

use Illuminate\Support\Facades\Route;
use App\Tools\ToolManager;

Route::get('/', function () {
    return view('welcome');
});

// API routes - skip CSRF middleware
Route::prefix('api')->group(function () {
    Route::get('/tools', function () {
        $manager = new ToolManager();
        return response()->json([
            'tools' => $manager->listTools()
        ]);
    })->withoutMiddleware('web');

    Route::post('/execute', function (Illuminate\Http\Request $request) {
        $manager = new ToolManager();
        $result = $manager->executeTool(
            $request->input('tool_name'),
            $request->input('input', [])
        );
        return response()->json($result);
    })->withoutMiddleware('web');
});
