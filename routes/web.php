<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('carts')->name('carts.')->controller(CartController::class)->group(function () {
    Route::get('index/{guest_id}', 'index')->name('index');
    Route::post('add', 'add')->name('add');
    Route::post('remove', 'remove')->name('remove');
    Route::get('clear/{guest_id}', 'clear')->name('clear');
    Route::get('first', 'first')->name('first');
});

Route::prefix('products')->name('products.')->controller(ProductController::class)->group(function () {
    Route::get('index/{guest_id}', 'index')->name('index');
});
