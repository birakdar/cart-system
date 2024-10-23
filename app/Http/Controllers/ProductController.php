<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index($guestId): JsonResponse
    {
        $products = Product::query()->get();
        $cart = Cart::query()->where('guest_id', $guestId)->first();

        // check if the cart exists and attach a boolean value to each product to indicate if it's in the cart
        if ($cart) {
            $cartItemsIds = Cart::query()->where('guest_id', $guestId)->first()->products->pluck('id')->toArray();
            $products->each(function ($product) use ($cartItemsIds) {
                $product->setAttribute('in_cart', in_array($product->id, $cartItemsIds));
            });
        }

        return response()->json([
            'products' => $products,
        ]);
    }
}
