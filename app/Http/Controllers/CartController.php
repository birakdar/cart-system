<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\RemoveFromCartRequest;
use App\Models\Cart;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    public function first(): JsonResponse
    {
        // generate a unique guest id
        $guestId = uniqid();

        return response()->json([
            'guest_id' => $guestId,
        ]);
    }

    public function index($guestId): JsonResponse
    {
        $cart = Cart::query()->with('products')->where('guest_id', $guestId)->first();

        return response()->json([
            'cart' => $cart,
        ]);
    }

    public function add(AddToCartRequest $request): JsonResponse
    {
        // check if the cart exists
        $cart = Cart::query()->where('guest_id', $request->input('guest_id'))->first();
        if  (! $cart) {
            $cart = Cart::query()->create([
                'guest_id' => $request->input('guest_id'),
                'total_items' => 0,
                'total_price' => 0,
            ]);
        }

        // check if the product is already in the cart, if so update the quantity otherwise attach the product
        $products = $cart->products();
        if ($products->where('product_id', $request->input('product_id'))->exists()) {
            //add the quantity to the existing quantity
            $oldQuantity = $products->where('product_id', $request->input('product_id'))->first()->pivot->quantity;
            $products->updateExistingPivot($request->input('product_id'), [
                'quantity' => $oldQuantity + $request->input('quantity'),
            ]);
        } else {
            $products->attach($request->input('product_id'), [
                'quantity' => $request->input('quantity'),
            ]);
        }

        // update the total items and total price
        $cart->update([
            'total_items' => $cart->products()->sum('quantity'),
            'total_price' => $cart->products()->sum('quantity * price'),
        ]);

        return response()->json();
    }

    public function remove(RemoveFromCartRequest $request): JsonResponse
    {
        $cart = Cart::query()->where('guest_id', $request->input('guest_id'))->firstOrFail();
        $cart->products()->detach($request->input('product_id'));
        $cart->update([
            'total_items' => $cart->products()->sum('quantity'),
            'total_price' => $cart->products()->sum('quantity * price'),
        ]);

        return response()->json();
    }

    public function clear($guestId): JsonResponse
    {
        $cart = Cart::query()->where('guest_id', $guestId)->firstOrFail();
        $cart->products()->detach();
        $cart->delete();

        return response()->json();
    }
}
