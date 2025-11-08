<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Tools\ToolManager;

// Public Auth Routes
Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|unique:users',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user = \App\Models\User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
    ]);

    return response()->json(['message' => 'User registered', 'user' => $user], 201);
});

Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => 'required|string|email',
        'password' => 'required|string',
    ]);

    if (\Illuminate\Support\Facades\Auth::attempt($credentials)) {
        $user = \Illuminate\Support\Facades\Auth::user();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['message' => 'Login successful', 'token' => $token, 'user' => $user], 200);
    }

    return response()->json(['message' => 'Invalid credentials'], 401);
});

// Public Tool Routes (No Auth Required)
Route::get('/tools', function () {
    $manager = new ToolManager();
    return response()->json(['tools' => $manager->listTools()]);
});

Route::post('/execute', function (Request $request) {
    $toolManager = new ToolManager();
    $toolName = $request->input('tool_name');
    $input = $request->input('input', []);

    $result = $toolManager->executeTool($toolName, $input);
    return response()->json(['output' => $result]);
});

// Protected Routes (Auth Required)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', function (Request $request) {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logout successful']);
    });
});
